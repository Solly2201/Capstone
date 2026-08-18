import {
  checkCivicTransition,
  computeCivicDueAt,
  isTerminalCivicStatus,
  type CivicPriority,
  type CivicStatus,
  type UserRole
} from "@cap/contracts";
import { CivicReport, type CivicReportDocument } from "../models/civic-report.js";
import type { HydratedDocument } from "mongoose";

/**
 * The civic authority workflow.
 *
 * Every status and priority change goes through this module. Routes
 * validate shapes and answer HTTP; the decision about whether a change
 * is allowed lives here and in the shared transition table, so there is
 * exactly one place to audit.
 *
 * Two properties this file is responsible for:
 *
 * 1. **No forged history.** History entries are built here from the
 *    authenticated actor and the server clock. Nothing from a request
 *    body reaches them except the free-text note.
 *
 * 2. **No lost updates.** The write is a conditional update filtered on
 *    the status the decision was made against, so if another authority
 *    moves the report between our read and our write, our update matches
 *    nothing and we report a conflict instead of silently overwriting
 *    their transition. That check-then-act race is the one real
 *    concurrency hazard in this workflow, and an embedded-history
 *    document makes it fixable without a transaction.
 */

export type WorkflowActor = {
  userId: string;
  role: UserRole;
};

export type WorkflowFailure = {
  ok: false;
  /** Maps directly onto an HTTP status in the route layer. */
  code: "NOT_FOUND" | "INVALID_TRANSITION" | "FORBIDDEN" | "CONFLICT";
  message: string;
};

export type WorkflowSuccess = {
  ok: true;
  report: HydratedDocument<CivicReportDocument>;
};

export type WorkflowResult = WorkflowSuccess | WorkflowFailure;

/**
 * Applies a status transition.
 *
 * Order matters: the report is loaded, the shared table judges the move
 * for this actor's role, and only then is the conditional write issued.
 */
export const applyStatusTransition = async (
  reportId: string,
  nextStatus: CivicStatus,
  actor: WorkflowActor,
  note?: string
): Promise<WorkflowResult> => {
  const report = await CivicReport.findById(reportId);
  if (!report) return { ok: false, code: "NOT_FOUND", message: "Report not found." };

  const currentStatus = report.status;
  const check = checkCivicTransition(currentStatus, nextStatus, actor.role, note);
  if (!check.ok) {
    return {
      ok: false,
      code: check.code === "FORBIDDEN_ROLE" ? "FORBIDDEN" : "INVALID_TRANSITION",
      message: check.message
    };
  }

  const at = new Date();
  const updated = await CivicReport.findOneAndUpdate(
    // The status filter is the concurrency guard, not just a lookup.
    { _id: report._id, status: currentStatus },
    {
      $set: { status: nextStatus },
      $push: {
        history: {
          type: "STATUS",
          from: currentStatus,
          to: nextStatus,
          actorId: actor.userId,
          actorRole: actor.role,
          ...(note ? { note } : {}),
          at
        }
      }
    },
    { new: true }
  );

  if (!updated) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "This report changed while you were working on it. Reload and try again."
    };
  }

  return { ok: true, report: updated };
};

/**
 * Sets priority, which moves the SLA deadline.
 *
 * The deadline is always re-derived from `createdAt`, never from now, so
 * re-prioritising a week-old report does not hand it a fresh window --
 * the clock runs from when the citizen reported the problem.
 *
 * Priority changes are recorded in the same history as status changes,
 * because "why is this due tomorrow?" is an audit question of exactly
 * the same kind as "why was this rejected?".
 */
export const applyPriorityChange = async (
  reportId: string,
  nextPriority: CivicPriority,
  actor: WorkflowActor,
  note?: string
): Promise<WorkflowResult> => {
  if (actor.role !== "AUTHORITY" && actor.role !== "ADMIN") {
    return { ok: false, code: "FORBIDDEN", message: "Your role cannot change priority." };
  }

  const report = await CivicReport.findById(reportId);
  if (!report) return { ok: false, code: "NOT_FOUND", message: "Report not found." };

  // A closed report has no remaining work to schedule, so moving its
  // deadline would be meaningless and would append history to something
  // already finished. Reopen it first if it genuinely needs attention.
  if (isTerminalCivicStatus(report.status)) {
    return {
      ok: false,
      code: "INVALID_TRANSITION",
      message: "Priority cannot be changed on a closed report."
    };
  }

  const currentPriority = report.priority;
  if (currentPriority === nextPriority) {
    return { ok: false, code: "INVALID_TRANSITION", message: "This report already has that priority." };
  }

  const at = new Date();
  const updated = await CivicReport.findOneAndUpdate(
    { _id: report._id, priority: currentPriority },
    {
      $set: { priority: nextPriority, dueAt: computeCivicDueAt(report.createdAt, nextPriority) },
      $push: {
        history: {
          type: "PRIORITY",
          from: currentPriority,
          to: nextPriority,
          actorId: actor.userId,
          actorRole: actor.role,
          ...(note ? { note } : {}),
          at
        }
      }
    },
    { new: true }
  );

  if (!updated) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "This report changed while you were working on it. Reload and try again."
    };
  }

  return { ok: true, report: updated };
};

/** HTTP status for each workflow failure code. */
export const workflowStatusCode: Record<WorkflowFailure["code"], number> = {
  NOT_FOUND: 404,
  INVALID_TRANSITION: 422,
  FORBIDDEN: 403,
  CONFLICT: 409
};

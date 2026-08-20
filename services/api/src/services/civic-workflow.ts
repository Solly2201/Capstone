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

// Every civic status and priority change goes through this module:
// routes validate shapes and answer HTTP, the decision lives here and in
// the shared transition table, so there is one place to audit.
//
// Two invariants this file owns:
//   No forged history -- entries are built from the authenticated actor
//     and the server clock; only the note comes from the request.
//   No lost updates -- the write is filtered on the status the decision
//     was made against, so a concurrent transition reports a conflict
//     instead of being silently overwritten. Embedded history is what
//     makes that fixable without a transaction.

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

// Order matters: load, let the shared table judge the move for this
// role, then issue the conditional write.
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

// Set priority, which moves the SLA deadline. The deadline is re-derived
// from createdAt rather than now, so re-prioritising a week-old report
// does not hand it a fresh window. Recorded in the same history as status
// changes, because "why is this due tomorrow?" is the same audit question.
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

  // A closed report has no work left to schedule; reopen it first.
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

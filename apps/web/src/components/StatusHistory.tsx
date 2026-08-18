import { AlertTriangle, Clock } from "lucide-react";
import {
  civicStatusLabels,
  type CivicHistoryEntry,
  type CivicReport,
  type CivicStatus
} from "@cap/contracts";

const statusLabel = (value: string) =>
  value in civicStatusLabels ? civicStatusLabels[value as CivicStatus] : value;

/**
 * The report's audit trail, as recorded by the server.
 *
 * Entries are rendered exactly as the API returned them. `actorId` is
 * only present for authority/admin viewers -- a citizen is shown which
 * role acted and why, not which member of staff.
 */
export function StatusHistory({ history }: { history: CivicHistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <p className="text-sm leading-6 text-ink/60">
        No activity yet. The report is waiting to be picked up by the civic authority.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {history.map((entry, index) => (
        <li key={`${entry.at}-${index}`} className="border-l-2 border-clay/40 pl-4">
          <p className="text-sm font-semibold">
            {entry.type === "PRIORITY"
              ? `Priority changed from ${entry.from} to ${entry.to}`
              : `${statusLabel(entry.from)} → ${statusLabel(entry.to)}`}
          </p>
          <p className="mt-1 text-xs text-ink/55">
            {new Date(entry.at).toLocaleString()} · by {entry.actorRole.toLowerCase()}
            {entry.actorId ? ` (${entry.actorId})` : ""}
          </p>
          {entry.note && <p className="mt-2 text-sm leading-6 text-ink/80">{entry.note}</p>}
        </li>
      ))}
    </ol>
  );
}

/**
 * SLA deadline indicator. `isOverdue` is computed by the server, so the
 * badge cannot disagree with the queue's own overdue filter.
 */
export function DueBadge({ report }: { report: Pick<CivicReport, "dueAt" | "isOverdue" | "status"> }) {
  if (!report.dueAt) return null;

  const due = new Date(report.dueAt).toLocaleDateString();

  if (report.isOverdue) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-800/30 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-900">
        <AlertTriangle size={12} aria-hidden="true" /> Overdue since {due}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-2.5 py-0.5 text-xs font-semibold text-ink/70">
      <Clock size={12} aria-hidden="true" /> Due {due}
    </span>
  );
}

import { civicStatusLabels, type CivicStatus } from "@cap/contracts";

const tones: Record<CivicStatus, string> = {
  SUBMITTED: "border-ink/20 bg-white text-ink/80",
  UNDER_REVIEW: "border-clay/40 bg-sandstone/60 text-ink",
  IN_PROGRESS: "border-clay/50 bg-clay/15 text-ink",
  RESOLVED: "border-sage/50 bg-sage/15 text-ink",
  REJECTED: "border-red-800/30 bg-red-50 text-red-900"
};

export function StatusBadge({ status }: { status: CivicStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${tones[status]}`}>
      {civicStatusLabels[status]}
    </span>
  );
}

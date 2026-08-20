import {
  hasReachedPetitionGoal,
  petitionProgressPercent,
  petitionStatusLabels,
  type PetitionStatus,
  type PetitionSummary
} from "@cap/contracts";

const tones: Record<PetitionStatus, string> = {
  OPEN: "border-sage/50 bg-sage/15 text-ink",
  UNDER_REVIEW: "border-clay/40 bg-sandstone/60 text-ink",
  ANSWERED: "border-clay/50 bg-clay/15 text-ink",
  CLOSED: "border-ink/20 bg-white text-ink/80",
  REJECTED: "border-red-800/30 bg-red-50 text-red-900"
};

export function PetitionStatusBadge({ status }: { status: PetitionStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${tones[status]}`}>
      {petitionStatusLabels[status]}
    </span>
  );
}

// Signature progress towards the creator's goal. The percentage and the
// goal-met test come from the shared contract helpers, so the bar cannot
// disagree with the authority queue's goalMet filter.
//
// The bar itself is decorative: the numbers are stated in text beside it,
// and the accessible value sits on the wrapper.
export function PetitionProgress({
  petition
}: {
  petition: Pick<PetitionSummary, "signatureCount" | "signatureGoal">;
}) {
  const percent = petitionProgressPercent(petition);
  const reached = hasReachedPetitionGoal(petition);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <p className="font-semibold">
          {petition.signatureCount.toLocaleString()}{" "}
          <span className="font-normal text-ink/60">
            signature{petition.signatureCount === 1 ? "" : "s"} of {petition.signatureGoal.toLocaleString()}
          </span>
        </p>
        {reached && <p className="text-xs font-bold uppercase tracking-wide text-sage">Goal reached</p>}
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`${percent}% of the signature goal`}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-sandstone"
      >
        <div
          aria-hidden="true"
          className={`h-full rounded-full transition-all ${reached ? "bg-sage" : "bg-clay"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

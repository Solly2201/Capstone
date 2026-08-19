import { zodResolver } from "@hookform/resolvers/zod";
import { ListChecks } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  createPetitionSchema,
  petitionCategories,
  petitionCategoryLabels,
  petitionDescriptionMax,
  petitionDescriptionMin,
  petitionGoalMax,
  petitionGoalMin,
  petitionTitleMax,
  petitionTitleMin,
  type CreatePetitionInput,
  type PetitionResponse
} from "@cap/contracts";
import { SiteShell } from "../components/SiteShell";
import { api, apiErrorMessage } from "../lib/api";

/**
 * Start a petition.
 *
 * The form validates against the same `createPetitionSchema` the API
 * parses, so the two cannot disagree about what is acceptable. The
 * client check is a convenience; the API is the enforcing side.
 *
 * The warning about text being permanent is not decoration -- there is
 * deliberately no edit endpoint, because people sign a specific text and
 * letting it be rewritten afterwards would invalidate their signatures.
 */
export function CreatePetitionPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreatePetitionInput>({
    resolver: zodResolver(createPetitionSchema),
    defaultValues: { category: "infrastructure", signatureGoal: 100 }
  });

  const description = watch("description") ?? "";

  const onSubmit = async (values: CreatePetitionInput) => {
    try {
      const response = await api.post<PetitionResponse>("/petitions", values);
      navigate(`/petitions/${response.data.petition.id}`, { replace: true });
    } catch (error) {
      setError("root", {
        message: apiErrorMessage(error, "We could not publish your petition. Please try again.")
      });
    }
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Module 3 &middot; Public participation</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Start a petition</h1>
          </div>
          <Link
            to="/petitions/mine"
            className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-semibold transition hover:border-clay/50 hover:text-clay"
          >
            <ListChecks size={17} aria-hidden="true" /> My petitions
          </Link>
        </div>
        <p className="mt-5 text-lg leading-8 text-ink/70">
          Describe what you want changed and why. Your petition is published under your account name
          so other residents know who is asking.
        </p>
        <p className="mt-4 rounded-xl border border-clay/30 bg-sandstone/40 p-4 text-sm leading-6 text-ink/80">
          Once published, a petition cannot be edited. People sign the text as it stands, so changing
          it afterwards would misrepresent what they supported. You can close your own petition at any
          time.
        </p>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="block text-sm font-semibold">
            Category
            <select className="field" {...register("category")}>
              {petitionCategories.map((value) => (
                <option key={value} value={value}>
                  {petitionCategoryLabels[value]}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category.message}</span>}
          </label>

          <label className="block text-sm font-semibold">
            Title
            <input
              className="field"
              type="text"
              placeholder="Restore the evening bus service on route 14"
              {...register("title")}
            />
            <span className="mt-1.5 block text-xs font-normal text-ink/55">
              Between {petitionTitleMin} and {petitionTitleMax} characters.
            </span>
            {errors.title && <span className="error-text">{errors.title.message}</span>}
          </label>

          <label className="block text-sm font-semibold">
            What you are asking for, and why
            <textarea
              className="field resize-y"
              rows={9}
              placeholder="Explain the problem, who it affects and what specifically you want the authority to do."
              {...register("description")}
            />
            <span className="mt-1.5 block text-xs font-normal text-ink/55">
              {description.trim().length} of {petitionDescriptionMax} characters (at least{" "}
              {petitionDescriptionMin}).
            </span>
            {errors.description && <span className="error-text">{errors.description.message}</span>}
          </label>

          <label className="block text-sm font-semibold">
            Signature goal
            <input
              className="field"
              type="number"
              min={petitionGoalMin}
              max={petitionGoalMax}
              step={1}
              {...register("signatureGoal")}
            />
            <span className="mt-1.5 block text-xs font-normal text-ink/55">
              How many signatures you are aiming for, between {petitionGoalMin.toLocaleString()} and{" "}
              {petitionGoalMax.toLocaleString()}. Reaching it flags the petition for the authority.
            </span>
            {errors.signatureGoal && <span className="error-text">{errors.signatureGoal.message}</span>}
          </label>

          {errors.root && (
            <p role="alert" className="rounded-xl border border-clay/40 bg-sandstone/50 px-5 py-4 text-sm leading-6">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-ink px-6 py-3 text-sm font-bold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Publishing…" : "Publish petition"}
          </button>
        </form>
      </section>
    </SiteShell>
  );
}

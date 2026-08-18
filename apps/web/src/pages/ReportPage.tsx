import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Crosshair, ListChecks } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  civicCategories,
  civicCategoryLabels,
  civicMediaAllowedMimeTypes,
  civicMediaMaxBytes,
  createCivicReportSchema,
  type CivicMediaMimeType,
  type CivicReportResponse,
  type CreateCivicReportInput
} from "@cap/contracts";
import { SiteShell } from "../components/SiteShell";
import { api, apiErrorMessage } from "../lib/api";

type GeoState = "idle" | "locating" | "denied" | "unsupported";

export function ReportPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [geoState, setGeoState] = useState<GeoState>("idle");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<CreateCivicReportInput>({
    resolver: zodResolver(createCivicReportSchema),
    defaultValues: { category: "pothole" }
  });

  /**
   * Browser geolocation only -- no map library and no reverse
   * geocoding in this milestone. The manual latitude/longitude inputs
   * stay the primary path; this button just fills them in.
   */
  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoState("unsupported");
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", Number(position.coords.latitude.toFixed(6)), { shouldValidate: true });
        setValue("longitude", Number(position.coords.longitude.toFixed(6)), { shouldValidate: true });
        setGeoState("idle");
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const onFileChange = (selected: File | null) => {
    setFileError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    // Mirrors the API's limits so an oversized file is not uploaded just
    // to be rejected. The API enforces these again on arrival.
    if (!civicMediaAllowedMimeTypes.includes(selected.type as CivicMediaMimeType)) {
      setFile(null);
      setFileError("Only JPEG and PNG images are accepted.");
      return;
    }
    if (selected.size > civicMediaMaxBytes) {
      setFile(null);
      setFileError("That image is larger than the 5 MB limit.");
      return;
    }
    setFile(selected);
  };

  const onSubmit = async (values: CreateCivicReportInput) => {
    try {
      const form = new FormData();
      form.append("category", values.category);
      form.append("title", values.title);
      form.append("description", values.description);
      form.append("latitude", String(values.latitude));
      form.append("longitude", String(values.longitude));
      if (values.landmark) form.append("landmark", values.landmark);
      if (file) form.append("image", file);

      const response = await api.post<CivicReportResponse>("/civic/reports", form);
      navigate(`/reports/${response.data.report.id}`, { replace: true });
    } catch (error) {
      setError("root", {
        message: apiErrorMessage(error, "We could not submit your report. Please try again.")
      });
    }
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Module 2 &middot; Civic reporting</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Report a civic issue</h1>
          </div>
          <Link
            to="/reports/mine"
            className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-semibold transition hover:border-clay/50 hover:text-clay"
          >
            <ListChecks size={17} aria-hidden="true" /> My reports
          </Link>
        </div>
        <p className="mt-5 text-lg leading-8 text-ink/70">
          Describe the problem and where it is. Your report is recorded against your account so you can
          follow it.
        </p>
        <p className="mt-4 rounded-xl border border-clay/30 bg-sandstone/40 p-4 text-sm leading-6 text-ink/80">
          Photos have their embedded metadata (including GPS coordinates and device details) removed before
          they are stored. Only the location you enter below is kept.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="block text-sm font-semibold">
            Category
            <select className="field" {...register("category")}>
              {civicCategories.map((category) => (
                <option key={category} value={category}>
                  {civicCategoryLabels[category]}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-text">Choose a category.</span>}
          </label>

          <label className="block text-sm font-semibold">
            Title
            <input className="field" type="text" placeholder="e.g. Deep pothole outside the bus stop" {...register("title")} />
            {errors.title && <span className="error-text">Give a short title of 5 to 120 characters.</span>}
          </label>

          <label className="block text-sm font-semibold">
            Description
            <textarea
              className="field resize-y"
              rows={4}
              placeholder="What is the problem, how long has it been there, and who does it affect?"
              {...register("description")}
            />
            {errors.description && <span className="error-text">Describe the issue in 10 to 2000 characters.</span>}
          </label>

          <fieldset className="rounded-xl border border-ink/15 p-4">
            <legend className="px-1 text-sm font-semibold">Location</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Latitude
                <input
                  className="field"
                  type="number"
                  step="any"
                  placeholder="19.07609"
                  {...register("latitude", { valueAsNumber: true })}
                />
                {errors.latitude && <span className="error-text">Enter a latitude between -90 and 90.</span>}
              </label>
              <label className="block text-sm font-semibold">
                Longitude
                <input
                  className="field"
                  type="number"
                  step="any"
                  placeholder="72.87742"
                  {...register("longitude", { valueAsNumber: true })}
                />
                {errors.longitude && <span className="error-text">Enter a longitude between -180 and 180.</span>}
              </label>
            </div>

            <button
              type="button"
              onClick={useMyLocation}
              disabled={geoState === "locating"}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-ink/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-sandstone disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Crosshair size={16} aria-hidden="true" />
              {geoState === "locating" ? "Finding your location…" : "Use my location"}
            </button>
            {geoState === "denied" && (
              <p className="mt-2 text-xs text-ink/60">
                Location permission was declined. Enter the coordinates manually.
              </p>
            )}
            {geoState === "unsupported" && (
              <p className="mt-2 text-xs text-ink/60">
                This browser cannot share a location. Enter the coordinates manually.
              </p>
            )}

            <label className="mt-4 block text-sm font-semibold">
              Landmark or address <span className="font-normal text-ink/55">(optional)</span>
              <input className="field" type="text" placeholder="Near the market gate" {...register("landmark")} />
              {errors.landmark && <span className="error-text">Keep this under 200 characters.</span>}
            </label>
          </fieldset>

          <div className="rounded-xl border border-ink/15 p-4">
            <p className="text-sm font-semibold">
              Photo <span className="font-normal text-ink/55">(optional)</span>
            </p>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-sandstone">
              <Camera size={16} aria-hidden="true" />
              Choose an image
              <input
                type="file"
                className="sr-only"
                accept={civicMediaAllowedMimeTypes.join(",")}
                aria-label="Attach a photo"
                onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              />
            </label>
            {file && <p className="mt-3 text-sm text-ink/70">Attached: {file.name}</p>}
            {fileError && <p className="error-text">{fileError}</p>}
            <p className="mt-3 text-xs text-ink/55">JPEG or PNG, up to 5 MB.</p>
          </div>

          {errors.root && (
            <p role="alert" className="rounded-lg border border-clay/30 bg-sandstone/50 px-4 py-3 text-sm leading-6">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-ink px-5 py-3.5 text-sm font-bold text-parchment transition hover:bg-coal disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? "Submitting report…" : "Submit report"}
          </button>
        </form>
      </section>
    </SiteShell>
  );
}

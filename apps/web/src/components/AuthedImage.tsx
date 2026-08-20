import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Report media is not public and a plain <img src> cannot send a bearer
// token, so the bytes are fetched through the shared axios instance and
// turned into an object URL that is revoked on unmount.
export function AuthedImage({ path, alt, className }: { path: string; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // jsdom has no object URLs.
    if (typeof URL.createObjectURL !== "function") {
      setFailed(true);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    api
      .get(path, { responseType: "blob" })
      .then((response) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(response.data as Blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  if (failed) {
    return <p className="text-xs text-ink/50">Photo unavailable.</p>;
  }

  if (!src) {
    return <div role="status" aria-label="Loading photo" className={`animate-pulse rounded-lg bg-ink/10 ${className ?? "h-40 w-full"}`} />;
  }

  return <img src={src} alt={alt} className={className} />;
}

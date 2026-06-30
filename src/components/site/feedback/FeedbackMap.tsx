"use client";

import { cn } from "@/lib/utils";

const DEFAULT_ZOOM = 13;
const FALLBACK_COORDS = { lat: 40.1811, lng: 44.5136 };

function parseCoords(coords: string): { lat: number; lng: number } | null {
  const [latRaw, lngRaw] = coords.split(",").map((part) => part.trim());
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function buildMapEmbedSrc(
  coords: { lat: number; lng: number } | null,
  title?: string,
  zoom = DEFAULT_ZOOM,
): string {
  const place = title?.trim();

  // When a place name is provided, search only by q.
  // Adding ll= alongside q= pins the marker to raw coordinates and
  // triggers "Place info couldn't load" on click.
  if (place) {
    const params = new URLSearchParams({
      q: place,
      z: String(zoom),
      output: "embed",
    });

    return `https://maps.google.com/maps?${params.toString()}`;
  }

  const { lat, lng } = coords ?? FALLBACK_COORDS;
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

type FeedbackMapProps = {
  coords: string;
  title?: string;
  className?: string;
};

export function FeedbackMap({ coords, title, className }: FeedbackMapProps) {
  const position = parseCoords(coords);
  const src = buildMapEmbedSrc(position, title);

  return (
    <div className={cn("relative h-full w-full", className)} aria-label={title || "Map"}>
      <iframe
        src={src}
        className="h-full w-full border-0"
        title={title || "Map"}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

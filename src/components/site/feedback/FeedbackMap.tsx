"use client";

import { Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_ZOOM = 13;
const MIN_ZOOM = 10;
const MAX_ZOOM = 18;
const FALLBACK_COORDS = { lat: 40.1811, lng: 44.5136 };

function parseCoords(coords: string): { lat: number; lng: number } | null {
  const [latRaw, lngRaw] = coords.split(",").map((part) => part.trim());
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function buildMapEmbedSrc(lat: number, lng: number, zoom: number): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=${zoom}&output=embed`;
}

type FeedbackMapProps = {
  coords: string;
  title?: string;
  className?: string;
};

export function FeedbackMap({ coords, title, className }: FeedbackMapProps) {
  const { lat, lng } = parseCoords(coords) ?? FALLBACK_COORDS;
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const containerRef = useRef<HTMLDivElement>(null);

  const changeZoom = useCallback((delta: number) => {
    setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + delta)));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      changeZoom(event.deltaY < 0 ? 1 : -1);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [changeZoom]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full touch-none", className)}
      aria-label={title || "Map"}
    >
      {title ? (
        <p className="pointer-events-none absolute top-4 left-4 z-10 rounded-md bg-white/90 px-3 py-2 font-medium text-[rgba(37,37,37,1)]">
          {title}
        </p>
      ) : null}

      <iframe
        src={buildMapEmbedSrc(lat, lng, zoom)}
        className="pointer-events-none h-full w-full border-0"
        title={title || "Map"}
        loading="lazy"
        tabIndex={-1}
      />

      <div className="absolute right-4 bottom-4 z-10 flex flex-col overflow-hidden rounded-lg border border-[rgba(198,198,198,1)] bg-white shadow-sm">
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => changeZoom(1)}
          className="flex size-9 items-center justify-center text-[rgba(37,37,37,1)] transition-colors hover:bg-[rgba(0,0,0,0.04)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden />
        </button>
        <div className="h-px bg-[rgba(217,217,217,1)]" />
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => changeZoom(-1)}
          className="flex size-9 items-center justify-center text-[rgba(37,37,37,1)] transition-colors hover:bg-[rgba(0,0,0,0.04)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

const LeafletView = dynamic(() => import("./LeafletView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-stone-100 text-sm text-stone-400">
      Cargando mapa…
    </div>
  ),
});

/** Mapa de solo lectura centrado en la ubicación del candidato. */
export default function MapView({
  lat,
  lng,
  label,
  height = 320,
}: {
  lat: number;
  lng: number;
  label?: string | null;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-lg">
      <LeafletView lat={lat} lng={lng} label={label} />
    </div>
  );
}

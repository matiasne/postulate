"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const LeafletPicker = dynamic(() => import("./LeafletPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-stone-100 text-sm text-stone-400">
      Cargando mapa…
    </div>
  ),
});

/**
 * Selector de ubicación. Escribe en inputs ocultos (location_lat, location_lng,
 * location_label) que consume la Server Action del perfil.
 */
export default function MapPicker({
  initialLat,
  initialLng,
  initialLabel,
}: {
  initialLat: number | null;
  initialLng: number | null;
  initialLabel: string | null;
}) {
  const [lat, setLat] = useState<number | null>(initialLat);
  const [lng, setLng] = useState<number | null>(initialLng);
  const [label, setLabel] = useState<string>(initialLabel ?? "");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function doSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        search,
      )}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const results = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      if (results.length === 0) {
        setSearchError("No se encontró esa dirección. Probá con otra o marcá el mapa.");
      } else {
        const r = results[0];
        setLat(parseFloat(r.lat));
        setLng(parseFloat(r.lon));
        if (!label) setLabel(r.display_name);
      }
    } catch {
      setSearchError("No se pudo buscar la dirección. Marcá el punto en el mapa.");
    } finally {
      setSearching(false);
    }
  }

  function handlePick(newLat: number, newLng: number) {
    setLat(newLat);
    setLng(newLng);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Buscar dirección (ej: Av. San Martín 100, Río Tercero)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doSearch(e as unknown as React.FormEvent);
          }}
        />
        <button type="button" onClick={doSearch} className="btn-outline shrink-0" disabled={searching}>
          {searching ? "Buscando…" : "Buscar"}
        </button>
      </div>
      {searchError && <p className="text-sm text-red-600">{searchError}</p>}

      <div className="h-72 w-full overflow-hidden rounded-lg border border-stone-200">
        <LeafletPicker lat={lat} lng={lng} onPick={handlePick} />
      </div>
      <p className="text-xs text-stone-500">
        Hacé clic en el mapa o arrastrá el pin para marcar dónde vivís.
      </p>

      <div>
        <label className="label" htmlFor="location_label">
          Etiqueta de la ubicación (opcional)
        </label>
        <input
          id="location_label"
          name="location_label"
          className="input"
          placeholder="Barrio / ciudad"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      {/* Valores que lee la Server Action */}
      <input type="hidden" name="location_lat" value={lat ?? ""} />
      <input type="hidden" name="location_lng" value={lng ?? ""} />

      {lat != null && lng != null ? (
        <p className="text-xs text-stone-500">
          Ubicación marcada: {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      ) : (
        <p className="text-xs text-stone-400">Sin ubicación (es opcional).</p>
      )}
    </div>
  );
}

/** Avatar "de vacío": la posición nunca queda ocupada. */
export default function EmptyAvatar({ size = 64 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full border-2 border-dashed border-stone-300 bg-stone-100 text-stone-400"
      style={{ width: size, height: size }}
      aria-label="Posición vacante"
      title="Posición vacante"
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    </div>
  );
}

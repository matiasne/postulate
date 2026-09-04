import Link from "next/link";
import Image from "next/image";
import EmptyAvatar from "@/components/EmptyAvatar";
import { publicUrl } from "@/lib/storage";
import { displayName } from "@/lib/auth";
import type { CandidacyWithProfile } from "@/lib/queries";

export default function CandidateCard({ candidacy }: { candidacy: CandidacyWithProfile }) {
  const photo = publicUrl("avatars", candidacy.photo_path);

  return (
    <Link
      href={`/candidatos/${candidacy.id}`}
      className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-md"
    >
      {photo ? (
        <Image
          src={photo}
          alt={displayName(candidacy.profile)}
          width={56}
          height={56}
          className="rounded-full object-cover"
          style={{ height: 56, width: 56 }}
          unoptimized
        />
      ) : (
        <EmptyAvatar size={56} />
      )}
      <div className="min-w-0">
        <p className="truncate font-semibold text-stone-900">{displayName(candidacy.profile)}</p>
        <p className="truncate text-sm text-stone-500">
          {candidacy.location_label || "Ubicación no declarada"}
        </p>
        <span className="mt-1 inline-block text-xs font-medium text-brand">Ver detalle →</span>
      </div>
    </Link>
  );
}

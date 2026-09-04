"use client";

import { useFormStatus } from "react-dom";
import { reportReference } from "@/app/actions/references";

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="text-xs text-stone-400 hover:text-red-600 hover:underline"
      disabled={pending}
      title="Reportar y ocultar esta referencia"
    >
      {pending ? "Reportando…" : "Reportar"}
    </button>
  );
}

export default function ReportButton({
  referenceId,
  candidacyId,
}: {
  referenceId: string;
  candidacyId: string;
}) {
  return (
    <form action={reportReference}>
      <input type="hidden" name="reference_id" value={referenceId} />
      <input type="hidden" name="candidacy_id" value={candidacyId} />
      <Btn />
    </form>
  );
}

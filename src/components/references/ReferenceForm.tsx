"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addReference, type ReferenceState } from "@/app/actions/references";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Publicando…" : "Publicar referencia"}
    </button>
  );
}

export default function ReferenceForm({ candidacyId }: { candidacyId: string }) {
  const [state, formAction] = useFormState<ReferenceState, FormData>(addReference, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
      }}
      className="space-y-3"
    >
      <input type="hidden" name="candidacy_id" value={candidacyId} />

      {state.error && <div className="alert-error">{state.error}</div>}
      {state.ok && state.message && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.message}
        </div>
      )}

      <div>
        <label className="label" htmlFor="body">
          Tu referencia
        </label>
        <textarea
          id="body"
          name="body"
          rows={3}
          className="input"
          placeholder="Contá tu experiencia o valoración sobre este candidato…"
        />
      </div>

      <div>
        <span className="label">Valoración</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="stance" value="favor" /> A favor
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="stance" value="contra" /> En contra
          </label>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Stance } from "@/lib/database.types";

/** Mínimo de referencias visibles para intentar un resumen (no inventar con 0). */
const MIN_REFERENCES_FOR_SUMMARY = 1;

type Ref = { body: string; stance: Stance };

type SummaryResult = {
  positive: string | null;
  negative: string | null;
  source: "anthropic" | "fallback" | "none";
  based_on_count: number;
};

/**
 * Regenera el resumen IA de un candidato a partir de sus referencias VISIBLES
 * (nunca de las ocultadas/reportadas) y lo persiste en ai_summaries.
 */
export async function generateSummary(candidacyId: string): Promise<SummaryResult> {
  const admin = createAdminClient();

  // Solo referencias visibles.
  const { data: refs } = await admin
    .from("candidate_references")
    .select("body, stance")
    .eq("candidacy_id", candidacyId)
    .eq("hidden", false)
    .order("created_at", { ascending: false });

  const references = (refs ?? []) as Ref[];
  const count = references.length;

  let result: SummaryResult;

  if (count < MIN_REFERENCES_FOR_SUMMARY) {
    // Sin referencias: no forzamos un resumen inventado.
    result = { positive: null, negative: null, source: "none", based_on_count: 0 };
  } else {
    const ai = await tryAnthropic(references);
    result = ai ?? { ...fallbackSummary(references), source: "fallback", based_on_count: count };
    if (ai) result.based_on_count = count;
  }

  await admin.from("ai_summaries").upsert(
    {
      candidacy_id: candidacyId,
      positive: result.positive,
      negative: result.negative,
      source: result.source,
      based_on_count: result.based_on_count,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "candidacy_id" },
  );

  return result;
}

/** Llama a Claude para resumir. Devuelve null si no hay API key o falla. */
async function tryAnthropic(references: Ref[]): Promise<SummaryResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new Anthropic({ apiKey });

    const list = references
      .map((r, i) => `${i + 1}. [${r.stance === "favor" ? "A FAVOR" : "EN CONTRA"}] ${r.body}`)
      .join("\n");

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              positive: {
                type: "string",
                description: "Resumen de los aspectos positivos según las referencias a favor.",
              },
              negative: {
                type: "string",
                description: "Resumen de los aspectos negativos según las referencias en contra.",
              },
            },
            required: ["positive", "negative"],
            additionalProperties: false,
          },
        },
      },
      system:
        "Sos un asistente que resume referencias públicas sobre candidatos a cargos de gobierno. " +
        "Resumí de forma neutral y honesta, en español rioplatense, basándote SOLO en las referencias dadas " +
        "(su texto y su valoración a favor/en contra). No inventes hechos que no estén en las referencias. " +
        "Si no hay material suficiente para una sección, escribí una frase breve aclarándolo.",
      messages: [
        {
          role: "user",
          content:
            `Referencias sobre el candidato:\n\n${list}\n\n` +
            "Devolvé un objeto JSON con 'positive' (aspectos positivos, 1-3 frases) y " +
            "'negative' (aspectos negativos, 1-3 frases).",
        },
      ],
    });

    // Con structured outputs, el contenido es JSON en el primer bloque de texto.
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const parsed = JSON.parse(textBlock.text) as { positive?: string; negative?: string };
    return {
      positive: parsed.positive?.trim() || null,
      negative: parsed.negative?.trim() || null,
      source: "anthropic",
      based_on_count: references.length,
    };
  } catch {
    // Cualquier fallo (red, cuota, parseo) cae al fallback.
    return null;
  }
}

/** Resumen determinístico a partir de las valoraciones y el texto. */
function fallbackSummary(references: Ref[]): { positive: string | null; negative: string | null } {
  const favor = references.filter((r) => r.stance === "favor");
  const contra = references.filter((r) => r.stance === "contra");

  const positive =
    favor.length > 0
      ? `${favor.length} ${favor.length === 1 ? "referencia habla" : "referencias hablan"} a favor. ` +
        "Destacan, por ejemplo: " +
        favor
          .slice(0, 3)
          .map((r) => `“${truncate(r.body, 140)}”`)
          .join(" · ")
      : null;

  const negative =
    contra.length > 0
      ? `${contra.length} ${contra.length === 1 ? "referencia expresa" : "referencias expresan"} reparos. ` +
        "Por ejemplo: " +
        contra
          .slice(0, 3)
          .map((r) => `“${truncate(r.body, 140)}”`)
          .join(" · ")
      : null;

  return { positive, negative };
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

import { getRuntimeEnvironment } from "@/lib/runtime-environment";

type JsonSchema = Record<string, unknown>;
type GeminiResponse = {
  error?: { message?: string };
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>;
};

function normalizeSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeSchema);
  if (!value || typeof value !== "object") return value;
  const source = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(source)) {
    if (key === "additionalProperties") continue;
    if (key === "type" && Array.isArray(child) && child.includes("null")) {
      normalized.type = child.find((item) => item !== "null");
      normalized.nullable = true;
      continue;
    }
    normalized[key] = normalizeSchema(child);
  }
  return normalized;
}

export async function generateStructuredJson<T>({ instructions, input, schema, maxOutputTokens = 6000 }: { instructions: string; input: string; schemaName: string; schema: JsonSchema; maxOutputTokens?: number }): Promise<T> {
  const runtimeEnv = getRuntimeEnvironment();
  const apiKey = runtimeEnv.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no servidor.");
  const model = runtimeEnv.GEMINI_MODEL || "gemini-3.6-flash";
  const schemaPrompt = JSON.stringify(normalizeSchema(schema));
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: instructions }],
      },
      contents: [{
        role: "user",
        parts: [{ text: `${input}\n\nRetorne somente JSON válido que respeite exatamente este schema, sem markdown ou comentários:\n${schemaPrompt}` }],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens,
        temperature: 0.15,
      },
    }),
  });
  const payload = await response.json() as GeminiResponse;
  if (!response.ok) {
    console.error("gemini_api_error", JSON.stringify({ status: response.status, message: payload.error?.message ?? "Resposta sem mensagem" }));
    throw new Error(payload.error?.message || `A geração falhou (${response.status}).`);
  }
  const output = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!output) throw new Error("O Gemini não retornou conteúdo utilizável.");
  return JSON.parse(output) as T;
}

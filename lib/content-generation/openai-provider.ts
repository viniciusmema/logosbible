import { getRuntimeEnvironment } from "@/lib/runtime-environment";

type JsonSchema = Record<string, unknown>;

type OpenAIResponse = {
  error?: { message?: string };
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
};

function extractOutputText(payload: OpenAIResponse) {
  return (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "")
    .join("")
    .trim();
}

export async function generateStructuredJson<T>({
  instructions,
  input,
  schemaName,
  schema,
  maxOutputTokens = 6000,
}: {
  instructions: string;
  input: string;
  schemaName: string;
  schema: JsonSchema;
  maxOutputTokens?: number;
}): Promise<T> {
  const runtimeEnv = getRuntimeEnvironment();
  const apiKey = runtimeEnv.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada no ambiente do servidor.");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: runtimeEnv.OPENAI_MODEL || "gpt-4o-mini",
      instructions,
      input,
      max_output_tokens: maxOutputTokens,
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
  });

  const payload = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || `A geração falhou (${response.status}).`);
  }

  const output = extractOutputText(payload);
  if (!output) throw new Error("A IA não retornou conteúdo utilizável.");
  return JSON.parse(output) as T;
}

import { requireRequestUser } from "@/lib/request-user";
import { getPortugueseBibles, YouVersionApiError } from "@/lib/youversion";

export async function GET(request: Request) {
  const user = requireRequestUser(request);
  if (!user) return Response.json({ error: "Faça login para acessar a Bíblia." }, { status: 401 });
  try {
    const versions = await getPortugueseBibles();
    return Response.json({ versions }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const status = error instanceof YouVersionApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : "Não foi possível carregar as traduções.";
    return Response.json({ error: message }, { status });
  }
}

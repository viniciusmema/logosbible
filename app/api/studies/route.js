import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { getUserStudies } from "@/lib/db";

export async function GET(request) {
  const token = getTokenFromRequest(request);
  if (!token) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const studies = getUserStudies(payload.userId);
  return Response.json({ studies });
}

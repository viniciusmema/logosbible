import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { removeStudy } from "@/lib/db";

export async function DELETE(request, { params }) {
  const token = getTokenFromRequest(request);
  if (!token) return Response.json({ error: "Não autorizado." }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return Response.json({ error: "Não autorizado." }, { status: 401 });

  removeStudy(payload.userId, params.id);
  return Response.json({ ok: true });
}

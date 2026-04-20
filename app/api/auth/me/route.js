import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { findUserById } from "@/lib/db";

export async function GET(request) {
  const token = getTokenFromRequest(request);
  if (!token) return Response.json({ user: null });

  const payload = verifyToken(token);
  if (!payload) return Response.json({ user: null });

  const user = findUserById(payload.userId);
  if (!user) return Response.json({ user: null });

  return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
}

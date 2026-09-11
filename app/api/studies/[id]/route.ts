import { and, eq } from "drizzle-orm";
import { studies } from "@/db/schema";
import { getDb } from "@/db";
import { requireRequestUser } from "@/lib/request-user";
import { toStudy } from "@/lib/study-row";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = requireRequestUser(request);
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json()) as { notes?: unknown };
  if (typeof body.notes !== "string") return Response.json({ error: "Anotação inválida." }, { status: 400 });
  const notes = body.notes.slice(0, 10000);
  const [updated] = await getDb().update(studies).set({ notes }).where(and(eq(studies.id, id), eq(studies.userId, user.id))).returning();
  if (!updated) return Response.json({ error: "Estudo não encontrado." }, { status: 404 });
  return Response.json({ study: toStudy(updated) });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = requireRequestUser(request);
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await context.params;
  await getDb().delete(studies).where(and(eq(studies.id, id), eq(studies.userId, user.id)));
  return new Response(null, { status: 204 });
}

import { and, eq } from "drizzle-orm";
import { studies } from "@/db/schema";
import { getDb } from "@/db";
import { requireRequestUser } from "@/lib/request-user";
import { generateDevotional } from "@/lib/content-generation";
import type { BibleStudyContent } from "@/lib/logos-types";
import { toStudy } from "@/lib/study-row";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = requireRequestUser(request);
  if (!user) return Response.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await context.params;
  const [row] = await getDb().select().from(studies).where(and(eq(studies.id, id), eq(studies.userId, user.id))).limit(1);
  if (!row) return Response.json({ error: "Estudo não encontrado." }, { status: 404 });
  if (row.devotionalJson) return Response.json({ study: toStudy(row), demo: false });
  try {
    const result = await generateDevotional({
      book: row.book,
      chapters: row.chapters,
      studyTitle: row.title,
      study: JSON.parse(row.academicJson) as BibleStudyContent,
    });
    const [updated] = await getDb().update(studies).set({ devotionalJson: JSON.stringify(result.devotional) }).where(and(eq(studies.id, id), eq(studies.userId, user.id))).returning();
    return Response.json({ study: { ...toStudy(updated), demo: result.demo } });
  } catch (error) {
    console.error("devotional_generation_failed", error);
    return Response.json({ error: "Não foi possível gerar o devocional agora." }, { status: 502 });
  }
}

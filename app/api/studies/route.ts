import { desc, eq } from "drizzle-orm";
import { studies } from "@/db/schema";
import { getDb } from "@/db";
import { isCanonicalBook } from "@/lib/bible";
import { requireRequestUser } from "@/lib/request-user";
import { generateBibleStudy } from "@/lib/content-generation";
import type { GenerationMode } from "@/lib/logos-types";
import { toStudy } from "@/lib/study-row";

export async function GET(request: Request) {
  const user = requireRequestUser(request);
  if (!user) return Response.json({ error: "Faça login para acessar seus estudos." }, { status: 401 });
  const rows = await getDb().select().from(studies).where(eq(studies.userId, user.id)).orderBy(desc(studies.createdAt)).limit(100);
  return Response.json({ studies: rows.map(toStudy) });
}

export async function POST(request: Request) {
  const user = requireRequestUser(request);
  if (!user) return Response.json({ error: "Faça login para criar um estudo." }, { status: 401 });
  const body = (await request.json()) as { book?: string; chapters?: string; notes?: string; readerPrompt?: string; generationMode?: GenerationMode };
  const book = body.book?.trim() ?? "";
  const chapters = body.chapters?.trim() ?? "";
  const notes = body.notes?.slice(0, 10000) ?? "";
  const readerPrompt = body.readerPrompt?.trim().slice(0, 4000) ?? "";
  const generationMode = body.generationMode;
  if (!isCanonicalBook(book) || !chapters || chapters.length > 40 || (generationMode !== "daily" && generationMode !== "deep")) {
    return Response.json({ error: "Confira o livro e os capítulos informados." }, { status: 400 });
  }
  try {
    const result = await generateBibleStudy({ book, chapters, readerPrompt, mode: generationMode });
    const id = crypto.randomUUID();
    const [row] = await getDb().insert(studies).values({
      id, userId: user.id, book, chapters, notes, readerPrompt, generationMode,
      title: result.titulo,
      academicJson: JSON.stringify(result.content),
      journeyJson: null,
    }).returning();
    return Response.json({ study: { ...toStudy(row), demo: result.demo } }, { status: 201 });
  } catch (error) {
    console.error("study_generation_failed", error);
    return Response.json({ error: "Não foi possível gerar o estudo agora. Tente novamente." }, { status: 502 });
  }
}

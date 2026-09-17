import { generateProgramDevotional } from "@/lib/content-generation";
import { GOVERNO_PROPRIO } from "@/lib/study-programs/governo-proprio";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { lessonId?: string };
  const lesson = GOVERNO_PROPRIO.lessons.find((item) => item.id === body.lessonId) ?? GOVERNO_PROPRIO.lessons[0];
  try { return Response.json({ devotional: await generateProgramDevotional({ title: lesson.title, theme: lesson.theme, objective: lesson.objective, bible: lesson.bible, complementary: lesson.complementary, book: lesson.requiredBook, referenceNotes: lesson.referenceNotes }) }); }
  catch (error) { console.error("program_devotional_generation_failed", error); return Response.json({ error: "Não foi possível gerar o devocional de hoje." }, { status: 502 }); }
}

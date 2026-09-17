import type { Study } from "@/lib/logos-types";
import type { studies } from "@/db/schema";

type StudyRow = typeof studies.$inferSelect;

export function toStudy(row: StudyRow): Study {
  return {
    id: row.id,
    book: row.book,
    chapters: row.chapters,
    title: row.title,
    generationMode: row.generationMode,
    content: JSON.parse(row.academicJson),
    devotional: row.devotionalJson ? JSON.parse(row.devotionalJson) : null,
    readerPrompt: row.readerPrompt,
    notes: row.notes,
    createdAt: row.createdAt,
    journey: row.journeyJson ? JSON.parse(row.journeyJson) : buildJourney(row),
  };
}

function buildJourney(row: StudyRow): Study["journey"] {
  const content = JSON.parse(row.academicJson) as Record<string, unknown>;
  if (content.__journey) return content.__journey as Study["journey"];
  const now = row.createdAt;
  const id = "day-1";
  return { sources: [{ kind: "BibleSource", reference: `${row.book} ${row.chapters}`, version: "NVT" }], sections: [{ id: "month-1", title: "Mês 1", lessonIds: [id] }], lessons: [{ id, title: row.title, theme: row.title, objective: "Ler, compreender e obedecer ao texto estudado.", requiredBookReading: "Leitura obrigatória do livro indicado", suggestedBookSection: `Capítulos ${row.chapters}`, primaryBibleReading: `${row.book} ${row.chapters}`, complementaryBibleReadings: [], estimatedMinutes: row.generationMode === "daily" ? 5 : 25, checklist: ["Ler o capítulo indicado do livro", "Ler o texto bíblico principal", "Ler o devocional do dia", "Responder às perguntas", "Registrar a aplicação pessoal", "Definir uma ação prática", "Fazer a oração", "Concluir o estudo do dia"].map((label, i) => ({ id: `item-${i + 1}`, label, required: true, done: false })), devotional: null, reflectionQuestions: ["O que este texto revela sobre Deus?", "Como ele confronta meu comportamento?"], answers: { showedMe: "", confrontsBehavior: "", obeyToday: "", practicalAction: "", personalPrayer: "", observations: "" }, status: "not_started" }], progress: { startedAt: now, lastActivity: now, lastLessonId: null, streak: 0 } };
}

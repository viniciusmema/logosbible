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
  };
}

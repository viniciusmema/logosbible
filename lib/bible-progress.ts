import { BOOKS } from "@/lib/bible";

const CHAPTER_COUNTS = [
  50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,
  28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22,
] as const;

export const BIBLE_CHAPTERS = Object.fromEntries(
  BOOKS.map((book, index) => [book, CHAPTER_COUNTS[index]]),
) as Record<string, number>;

export const TOTAL_BIBLE_CHAPTERS = CHAPTER_COUNTS.reduce((total, count) => total + count, 0);
export const PROGRESS_STORAGE_KEY = "logos_reading_progress_v1";

export type BibleProgress = {
  version: 1;
  completed: Record<string, number[]>;
  latestBook: string | null;
  updatedAt: string | null;
};

export const EMPTY_PROGRESS: BibleProgress = {
  version: 1,
  completed: {},
  latestBook: null,
  updatedAt: null,
};

export function parseChapters(value: string, maximum: number) {
  const chapters = new Set<number>();
  const matches = value.match(/\d+\s*[-–—]\s*\d+|\d+/g) ?? [];
  for (const match of matches) {
    const range = match.split(/[-–—]/).map((part) => Number(part.trim()));
    const start = range[0];
    const end = range[1] ?? start;
    if (!Number.isInteger(start) || !Number.isInteger(end)) continue;
    for (let chapter = Math.min(start, end); chapter <= Math.max(start, end); chapter += 1) {
      if (chapter >= 1 && chapter <= maximum) chapters.add(chapter);
    }
  }
  return [...chapters].sort((a, b) => a - b);
}

export function registerStudy(progress: BibleProgress, book: string, selection: string): BibleProgress {
  const maximum = BIBLE_CHAPTERS[book];
  if (!maximum) return progress;
  const parsed = parseChapters(selection, maximum);
  if (parsed.length === 0) return progress;
  const previous = progress.completed[book] ?? [];
  return {
    version: 1,
    completed: { ...progress.completed, [book]: [...new Set([...previous, ...parsed])].sort((a, b) => a - b) },
    latestBook: book,
    updatedAt: new Date().toISOString(),
  };
}

export function progressSummary(progress: BibleProgress) {
  const chaptersRead = BOOKS.reduce((total, book) => total + (progress.completed[book]?.length ?? 0), 0);
  const completedBooks = BOOKS.filter((book) => (progress.completed[book]?.length ?? 0) === BIBLE_CHAPTERS[book]);
  let currentBook = progress.latestBook ?? BOOKS[0];
  let currentChapter = Math.min((progress.completed[currentBook]?.at(-1) ?? 0) + 1, BIBLE_CHAPTERS[currentBook]);

  if ((progress.completed[currentBook]?.length ?? 0) === BIBLE_CHAPTERS[currentBook]) {
    const start = BOOKS.indexOf(currentBook as (typeof BOOKS)[number]);
    const next = BOOKS.slice(start + 1).find((book) => (progress.completed[book]?.length ?? 0) < BIBLE_CHAPTERS[book]);
    if (next) { currentBook = next; currentChapter = 1; }
  }

  return {
    chaptersRead,
    completedBooks,
    currentBook,
    currentChapter,
    percentage: Math.min(100, (chaptersRead / TOTAL_BIBLE_CHAPTERS) * 100),
  };
}

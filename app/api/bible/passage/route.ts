import { requireRequestUser } from "@/lib/request-user";
import { BIBLE_BOOK_CODES, isCanonicalBook } from "@/lib/bible";
import { BIBLE_CHAPTERS } from "@/lib/bible-progress";
import { getBiblePassage, YouVersionApiError } from "@/lib/youversion";

export async function GET(request: Request) {
  const user = requireRequestUser(request);
  if (!user) return Response.json({ error: "Faça login para acessar a Bíblia." }, { status: 401 });
  const url = new URL(request.url);
  const book = url.searchParams.get("book") ?? "";
  const chapter = Number(url.searchParams.get("chapter"));
  const bibleId = Number(url.searchParams.get("version"));
  if (!isCanonicalBook(book) || !Number.isInteger(chapter) || chapter < 1 || chapter > BIBLE_CHAPTERS[book] || !Number.isInteger(bibleId) || bibleId < 1) {
    return Response.json({ error: "Confira a tradução, o livro e o capítulo." }, { status: 400 });
  }
  try {
    const passage = await getBiblePassage(bibleId, `${BIBLE_BOOK_CODES[book as keyof typeof BIBLE_BOOK_CODES]}.${chapter}`);
    return Response.json({ passage }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    const status = error instanceof YouVersionApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : "Não foi possível carregar o capítulo.";
    return Response.json({ error: message }, { status });
  }
}

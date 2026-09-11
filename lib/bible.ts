export const BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares", "Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel", "Oseias", "Joel", "Amós", "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias", "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse",
] as const;

const USFM_BOOK_CODES = [
  "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO", "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL", "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV",
] as const;

export const BIBLE_BOOK_CODES = Object.fromEntries(
  BOOKS.map((book, index) => [book, USFM_BOOK_CODES[index]]),
) as Record<(typeof BOOKS)[number], string>;

const SECTIONS: Array<{ end: number; testament: string; section: string; emphasis: string }> = [
  { end: 4, testament: "Antigo Testamento", section: "Pentateuco", emphasis: "criação, aliança, libertação, santidade e formação do povo de Deus" },
  { end: 16, testament: "Antigo Testamento", section: "Livros históricos", emphasis: "terra, liderança, reino, exílio, retorno e fidelidade à aliança" },
  { end: 21, testament: "Antigo Testamento", section: "Poesia e sabedoria", emphasis: "adoração, sofrimento, sabedoria, sentido da vida e amor" },
  { end: 38, testament: "Antigo Testamento", section: "Profetas", emphasis: "justiça, juízo, arrependimento, esperança e restauração" },
  { end: 42, testament: "Novo Testamento", section: "Evangelhos", emphasis: "a pessoa, a obra, o reino, a morte e a ressurreição de Jesus" },
  { end: 43, testament: "Novo Testamento", section: "História da igreja", emphasis: "Espírito Santo, missão, testemunho e expansão do evangelho" },
  { end: 64, testament: "Novo Testamento", section: "Cartas", emphasis: "evangelho, igreja, maturidade cristã, perseverança e vida no Espírito" },
  { end: 65, testament: "Novo Testamento", section: "Literatura apocalíptica", emphasis: "soberania de Cristo, perseverança, juízo e nova criação" },
];

export function getBookMeta(book: string) {
  const index = BOOKS.indexOf(book as (typeof BOOKS)[number]);
  const position = Math.max(index, 0);
  const section = SECTIONS.find((item) => position <= item.end) ?? SECTIONS[SECTIONS.length - 1];
  return { book, ...section };
}

export function isCanonicalBook(book: string) {
  return BOOKS.includes(book as (typeof BOOKS)[number]);
}

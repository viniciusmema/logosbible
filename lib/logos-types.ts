export type GenerationMode = "daily" | "deep";

export type BiblicalConnection = {
  referencia: string;
  explicacao: string;
};

export type BibleStudyContent = {
  resumo_leitura: string;
  contexto_historico: string;
  contexto_imediato: string;
  estrutura_texto: Array<{ titulo: string; descricao: string }>;
  acontecimentos_principais: Array<{ titulo: string; explicacao: string }>;
  temas_centrais: Array<{ tema: string; explicacao: string }>;
  palavras_importantes: Array<{ termo: string; explicacao: string }>;
  conexoes_biblicas: BiblicalConnection[];
  questoes_interpretativas: Array<{ questao: string; sintese: string }>;
  curiosidades: Array<{ titulo: string; conteudo: string }>;
  sobre_sua_duvida: string | null;
  aplicacao_pastoral: string;
};

export type DailyStudy = {
  contexto: string;
  conexoes_biblicas?: BiblicalConnection[];
  aplicacao: string;
  oracao: string;
};

export type DeepStudy = {
  contexto_historico: string;
  estrutura_literaria: string;
  palavras_chave?: Array<{ termo: string; explicacao: string }>;
  conexoes_biblicas: string | BiblicalConnection[];
  questoes_interpretativas?: Array<{ questao: string; sintese: string }>;
  aplicacao_pastoral?: string;

  // Campos mantidos para estudos aprofundados criados antes desta versão.
  autoria_e_data?: string;
  temas_centrais?: string[];
  curiosidades_culturais?: string;
  extras?: Array<{ titulo: string; conteudo: string }>;
};

export type DevotionalStudy = {
  meditacao: string;
  verso_chave: { referencia: string; texto: string };
  revela_sobre_deus?: string;
  confronta_em_nos?: string;
  aplicacao_pratica?: string;
  pergunta_reflexao?: string;
  aplicacao?: string;
  oracao: string;
};

export type Study = {
  id: string;
  book: string;
  chapters: string;
  title: string;
  generationMode: GenerationMode;
  content: BibleStudyContent | DailyStudy | DeepStudy;
  devotional: DevotionalStudy | null;
  readerPrompt: string;
  notes: string;
  createdAt: string;
  demo?: boolean;
};

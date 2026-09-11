import { getRuntimeEnvironment } from "@/lib/runtime-environment";

const API_BASE = "https://api.youversion.com/v1";

export type YouVersionBible = {
  id: number;
  abbreviation: string;
  title: string;
  preferred: boolean;
  copyright: string;
  info: string;
  publisherUrl: string | null;
  youVersionUrl: string | null;
};

export type YouVersionPassage = {
  id: string;
  reference: string;
  content: string;
};

type BibleApiRecord = {
  id?: number;
  abbreviation?: string;
  localized_abbreviation?: string;
  title?: string;
  localized_title?: string;
  copyright?: string;
  info?: string;
  publisher_url?: string;
  youversion_deep_link?: string;
  language_tag?: string;
};

type BibleCollection = { data?: BibleApiRecord[]; message?: string };
type PassageRecord = { id?: string; reference?: string; content?: string; message?: string };

const LICENSED_NVI_BIBLES: BibleApiRecord[] = [
  {
    id: 129,
    abbreviation: "NVI",
    localized_abbreviation: "NVI",
    title: "Nova Versão Internacional — Português",
    localized_title: "Nova Versão Internacional — Português",
    language_tag: "pt",
  },
  {
    id: 4360,
    abbreviation: "ptNVI",
    localized_abbreviation: "NVI 2011",
    title: "Nova Versão Internacional 2011",
    localized_title: "Nova Versão Internacional 2011 — Português do Brasil",
    language_tag: "pt-BR",
  },
];

export class YouVersionApiError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
  }
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function translationRank(bible: BibleApiRecord) {
  if (bible.id === 129) return 0;
  if (bible.id === 4360) return 1;
  const text = normalize([
    bible.abbreviation,
    bible.localized_abbreviation,
    bible.title,
    bible.localized_title,
  ].filter(Boolean).join(" "));
  if (/\bNVT\b/.test(text) || text.includes("NOVA VERSAO TRANSFORMADORA")) return 2;
  if (/\bNTLH\b/.test(text) || text.includes("NOVA TRADUCAO NA LINGUAGEM DE HOJE")) return 3;
  if (/\bNVI\b/.test(text) || text.includes("NOVA VERSAO INTERNACIONAL")) return 4;
  return -1;
}

function safeExternalUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function youVersionFetch(path: string) {
  const key = getRuntimeEnvironment().YOUVERSION_APP_KEY;
  if (!key) throw new YouVersionApiError("O leitor bíblico ainda não foi configurado.", 503);
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "X-YVP-App-Key": key,
      "Accept": "application/json",
      "Accept-Language": "pt-BR,pt;q=0.9",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    const body = await response.text();
    console.error("youversion_api_error", JSON.stringify({ status: response.status, body: body.slice(0, 500) }));
    if (response.status === 401 || response.status === 403) {
      throw new YouVersionApiError("A App Key ainda não tem acesso às traduções solicitadas.", response.status);
    }
    if (response.status === 429) throw new YouVersionApiError("O limite temporário de leituras foi atingido. Tente novamente em alguns minutos.", 429);
    throw new YouVersionApiError("Não foi possível carregar o texto bíblico agora.", response.status);
  }
  return response;
}

export async function getPortugueseBibles(): Promise<YouVersionBible[]> {
  const query = new URLSearchParams();
  query.append("language_ranges[]", "pt");
  query.append("language_ranges[]", "por");
  query.append("language_ranges[]", "pt-BR");
  query.set("page_size", "99");
  const response = await youVersionFetch(`/bibles?${query.toString()}`);
  const payload = await response.json() as BibleCollection;
  const catalog = payload.data ?? [];
  const catalogIds = new Set(catalog.map((bible) => bible.id));
  const versions = [...catalog, ...LICENSED_NVI_BIBLES.filter((bible) => !catalogIds.has(bible.id))]
    .map((bible) => ({ bible, rank: translationRank(bible) }))
    .filter(({ bible }) => typeof bible.id === "number")
    .sort((a, b) => {
      const firstRank = a.rank < 0 ? 99 : a.rank;
      const secondRank = b.rank < 0 ? 99 : b.rank;
      return firstRank - secondRank || String(a.bible.localized_title || a.bible.title).localeCompare(String(b.bible.localized_title || b.bible.title), "pt-BR");
    })
    .map(({ bible, rank }) => ({
      id: bible.id as number,
      abbreviation: bible.localized_abbreviation || bible.abbreviation || "Bíblia",
      title: bible.localized_title || bible.title || "Bíblia",
      preferred: rank >= 0,
      copyright: bible.copyright || "",
      info: bible.info || "",
      publisherUrl: safeExternalUrl(bible.publisher_url),
      youVersionUrl: safeExternalUrl(bible.youversion_deep_link),
    }));
  return versions;
}

function sanitizeTrustedScriptureHtml(value: string) {
  return value
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/javascript:/gi, "");
}

export async function getBiblePassage(bibleId: number, passageId: string): Promise<YouVersionPassage> {
  const query = new URLSearchParams({ format: "html" });
  const response = await youVersionFetch(`/bibles/${bibleId}/passages/${encodeURIComponent(passageId)}?${query.toString()}`);
  const payload = await response.json() as PassageRecord;
  if (!payload.content || !payload.reference) throw new YouVersionApiError("A tradução não retornou este capítulo.", 404);
  return {
    id: payload.id || passageId,
    reference: payload.reference,
    content: sanitizeTrustedScriptureHtml(payload.content),
  };
}

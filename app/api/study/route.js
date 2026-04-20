import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Você é um estudioso bíblico e comentarista teológico de alto nível. Gere um estudo bíblico aprofundado em português brasileiro.

Retorne APENAS JSON válido, sem markdown, sem texto fora do JSON:
{
  "titulo": "Título descritivo e evocativo do estudo",
  "academic": {
    "contexto_historico": "Texto rico sobre contexto histórico, geopolítica, situação do povo ou da Igreja primitiva",
    "autoria_e_data": "Autoria, debates acadêmicos relevantes, datação aproximada com embasamento",
    "estrutura_literaria": "Gênero literário, estrutura narrativa, divisão interna dos capítulos, recursos retóricos",
    "temas_centrais": ["Tema teológico 1", "Tema teológico 2", "Tema teológico 3"],
    "curiosidades_culturais": "Curiosidades arqueológicas, costumes da época, nuances do hebraico ou grego original que enriquecem a interpretação",
    "extras": [{"titulo": "Título do extra", "conteudo": "Conteúdo"}]
  },
  "devotional": {
    "meditacao": "Meditação contemplativa e pastoral no espírito de Spurgeon — rica, direta, cristocêntrica",
    "verso_chave": {"referencia": "Livro X:Y", "texto": "Texto completo na NVT"},
    "aplicacao": "Aplicação prática e transformadora para a vida atual do crente",
    "oracao": "Oração sincera e pessoal baseada nas verdades do texto"
  }
}

Diretrizes:
- Use NVT como tradução principal; cite NVI ou NHTL quando houver divergência relevante
- Seção acadêmica: rigorosa, mencione estudiosos quando pertinente, inclua dados arqueológicos reais
- Seção devocional: calorosa, contemplativa, evite clichês evangélicos
- extras[]: inclua APENAS quando houver algo genuinamente notável. Se não houver, retorne array vazio []`;

export async function POST(request) {
  try {
    const { book, chapters, notes } = await request.json();

    if (!book || !chapters) {
      return Response.json({ error: "Livro e capítulos são obrigatórios." }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = client.messages.stream({
      model: "claude-opus-4-7",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Livro: ${book}\nCapítulos: ${chapters}${notes ? `\nObservações do leitor: ${notes}` : ""}`,
        },
      ],
    });

    const message = await stream.finalMessage();

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (error) {
    console.error("Erro na geração do estudo:", error);
    return Response.json({ error: "Erro ao gerar o estudo." }, { status: 500 });
  }
}

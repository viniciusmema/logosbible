const SYSTEM_PROMPT = `Você é um estudioso bíblico e comentarista teológico de alto nível. Gere um estudo bíblico aprofundado em português brasileiro.

Retorne APENAS JSON válido, sem markdown, sem texto fora do JSON:
{
  "titulo": "Título descritivo e evocativo do estudo",
  "academic": {
    "contexto_historico": "Texto rico sobre contexto histórico",
    "autoria_e_data": "Autoria, debates acadêmicos, datação",
    "estrutura_literaria": "Gênero literário, estrutura narrativa",
    "temas_centrais": ["Tema 1", "Tema 2", "Tema 3"],
    "curiosidades_culturais": "Curiosidades arqueológicas e culturais",
    "extras": [{"titulo": "Título", "conteudo": "Conteúdo"}]
  },
  "devotional": {
    "meditacao": "Meditação no espírito de Spurgeon",
    "verso_chave": {"referencia": "Livro X:Y", "texto": "Texto na NVT"},
    "aplicacao": "Aplicação prática",
    "oracao": "Oração baseada no texto"
  }
}

Use NVT como tradução principal. Seção acadêmica rigorosa. Seção devocional calorosa. extras[] só quando houver algo genuinamente notável, senão retorna array vazio.`;

export async function POST(request) {
  try {
    const { book, chapters, notes } = await request.json();

    if (!book || !chapters) {
      return Response.json({ error: "Livro e capítulos são obrigatórios." }, { status: 400 });
    }

    const userMessage = `Livro: ${book}\nCapítulos: ${chapters}${notes ? `\nObservações: ${notes}` : ""}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Resposta vazia");

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (error) {
    console.error("Erro na geração do estudo:", error);
    return Response.json({ error: "Erro ao gerar o estudo." }, { status: 500 });
  }
}
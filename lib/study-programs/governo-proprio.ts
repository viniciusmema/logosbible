export type ProgramLesson = { id: string; day: number; title: string; theme: string; objective: string; requiredBook: string; requiredBookSection: string; bible: string; complementary: string[]; questions: string[]; referenceNotes: string };
export const GOVERNO_PROPRIO = {
  id: "governo-proprio", title: "Governo próprio", subtitle: "Uma jornada de disciplina, obediência e maturidade cristã", duration: "6 livros · 6 etapas", currentBook: "Celebração da Disciplina", currentAuthor: "Richard J. Foster",
  bibliography: [
    { title: "Celebração da Disciplina", author: "Richard J. Foster", required: true },
    { title: "O Espírito das Disciplinas", author: "Dallas Willard", required: true },
    { title: "Prática da Presença de Deus", author: "Irmão Lawrence", required: true },
    { title: "Disciplinas do Homem Cristão", author: "R. Kent Hughes", required: true },
    { title: "Como Integrar Fé e Trabalho", author: "Timothy Keller", required: true },
    { title: "A Vocação Espiritual do Pastor", author: "Eugene Peterson", required: true },
  ],
  lessons: [
    { id: "day-1", day: 1, title: "A quem pertenço?", theme: "A obediência começa na rendição", objective: "Reconhecer que o governo próprio cristão nasce da submissão a Deus, não do controle autônomo da própria vida.", requiredBook: "Celebração da Disciplina — Richard J. Foster", requiredBookSection: "Capítulo 1 — As disciplinas espirituais", bible: "Romanos 12:1–2", complementary: ["Gálatas 5:22–25", "1 Coríntios 9:24–27"], questions: ["O que precisa ser colocado novamente sob o governo de Deus?", "Qual comportamento revela falta de domínio próprio?"], referenceNotes: "A obra apresenta as disciplinas espirituais como meios de graça e treinamento para a liberdade, não como mérito religioso. O foco é criar espaço para Deus agir, sem transformar a prática em performance." },
  ],
};

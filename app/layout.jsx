export const metadata = {
  title: "Lógos — Estudos Bíblicos",
  description: "Seu diário pessoal de estudos bíblicos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

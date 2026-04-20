import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";
import { findUserByEmail } from "@/lib/db";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password)
      return Response.json({ error: "Email e senha são obrigatórios." }, { status: 400 });

    const user = findUserByEmail(email);
    if (!user)
      return Response.json({ error: "Email ou senha incorretos." }, { status: 401 });

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid)
      return Response.json({ error: "Email ou senha incorretos." }, { status: 401 });

    const token = createToken(user.id);
    const response = Response.json({ user: { id: user.id, name: user.name, email: user.email } });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return Response.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}

import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { findUserByEmail, createUser } from "@/lib/db";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password)
      return Response.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });

    if (password.length < 6)
      return Response.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });

    if (findUserByEmail(email))
      return Response.json({ error: "Este email já está cadastrado." }, { status: 400 });

    const passwordHash = await hashPassword(password);
    const user = createUser({ name, email, passwordHash });
    const token = createToken(user.id);

    const response = Response.json({ user: { id: user.id, name: user.name, email: user.email } });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Erro no registro:", error);
    return Response.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}

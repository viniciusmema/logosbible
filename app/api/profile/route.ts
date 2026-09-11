import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { readerProfiles } from "@/db/schema";
import { requireRequestUser } from "@/lib/request-user";
import type { GenerationMode } from "@/lib/logos-types";

const DEFAULT_PROFILE = { preferredName: "", avatar: null, defaultMode: "daily" as GenerationMode };
const MAX_AVATAR_LENGTH = 300_000;

function serializeProfile(row: typeof readerProfiles.$inferSelect) {
  return {
    preferredName: row.preferredName,
    avatar: row.avatarData,
    defaultMode: row.defaultMode,
  };
}

export async function GET(request: Request) {
  const user = requireRequestUser(request);
  if (!user) return Response.json({ error: "Faça login para acessar seu perfil." }, { status: 401 });
  const [row] = await getDb().select().from(readerProfiles).where(eq(readerProfiles.userId, user.id)).limit(1);
  return Response.json({ exists: Boolean(row), profile: row ? serializeProfile(row) : DEFAULT_PROFILE });
}

export async function PATCH(request: Request) {
  const user = requireRequestUser(request);
  if (!user) return Response.json({ error: "Faça login para salvar seu perfil." }, { status: 401 });
  const body = (await request.json()) as { preferredName?: unknown; avatar?: unknown; defaultMode?: unknown };
  const preferredName = typeof body.preferredName === "string" ? body.preferredName.trim().slice(0, 80) : "";
  const defaultMode = body.defaultMode === "deep" ? "deep" : body.defaultMode === "daily" ? "daily" : null;
  const avatar = body.avatar === null ? null : typeof body.avatar === "string" ? body.avatar : undefined;
  const validAvatar = avatar === null || (typeof avatar === "string" && avatar.length <= MAX_AVATAR_LENGTH && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar));
  if (!defaultMode || !validAvatar) return Response.json({ error: "Os dados do perfil não são válidos." }, { status: 400 });

  const updatedAt = new Date().toISOString();
  const [row] = await getDb().insert(readerProfiles).values({
    userId: user.id,
    preferredName,
    avatarData: avatar,
    defaultMode,
    updatedAt,
  }).onConflictDoUpdate({
    target: readerProfiles.userId,
    set: { preferredName, avatarData: avatar, defaultMode, updatedAt },
  }).returning();
  return Response.json({ profile: serializeProfile(row) });
}

import { requireChatGPTUser } from "@/app/chatgpt-auth";
import LogosApp from "@/components/logos-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireChatGPTUser("/");
  return <LogosApp displayName={user.displayName} />;
}

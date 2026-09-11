export function requireRequestUser(request: Request) {
  const userId = request.headers.get("oai-authenticated-user-id");
  if (!userId) return null;
  return {
    id: userId,
    email: request.headers.get("oai-authenticated-user-email") ?? "",
  };
}

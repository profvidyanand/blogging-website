export async function readJsonResponse<T = Record<string, unknown>>(
  res: Response,
): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = text.trimStart().slice(0, 80);
    if (preview.startsWith("<!DOCTYPE") || preview.startsWith("<html")) {
      throw new Error(
        res.ok
          ? "Server returned an HTML page instead of JSON."
          : `Request failed (${res.status}). The API route may be unavailable.`,
      );
    }
    throw new Error("Server returned an invalid JSON response.");
  }
}

export async function fetchJson<T = Record<string, unknown>>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ res: Response; data: T }> {
  const res = await fetch(input, init);
  const data = await readJsonResponse<T>(res);
  return { res, data };
}

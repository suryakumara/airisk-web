import { useAuthStore } from "../store/useAuthStore";

const API = import.meta.env.VITE_PROXY_URL ?? "http://localhost:3000";

const authHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const bearerHeader = (): Record<string, string> => ({
  Authorization: `Bearer ${useAuthStore.getState().token}`,
});

// ── Bots ──────────────────────────────────────────────────────────────────────
export const apiFetchBots = () =>
  fetch(`${API}/api/bots`, { headers: authHeaders() }).then((r) => r.json());

export const apiCreateBot = (data: { token: string; name: string; description?: string }) =>
  fetch(`${API}/api/bots`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const apiUpdateBot = (id: number, data: { name?: string; description?: string; chatId?: string }) =>
  fetch(`${API}/api/bots/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const apiDeleteBot = (id: number) =>
  fetch(`${API}/api/bots/${id}`, { method: "DELETE", headers: authHeaders() }).then((r) => r.json());

export const apiReorderBots = (order: { id: number; botOrder: number }[]) =>
  fetch(`${API}/api/bots/reorder/batch`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ order }),
  }).then((r) => r.json());

// ── Messages ─────────────────────────────────────────────────────────────────
export const apiFetchMessages = (botId: number, since?: string) =>
  fetch(
    `${API}/api/bots/${botId}/messages${since ? `?since=${encodeURIComponent(since)}` : ""}`,
    { headers: authHeaders() }
  ).then((r) => r.json());

export const apiSendText = (botId: number, text: string, chatId?: string) =>
  fetch(`${API}/api/bots/${botId}/send`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ text, chatId }),
  }).then((r) => r.json());

export const apiSendMedia = (
  botId: number,
  file: File | Blob,
  type: string,
  caption?: string,
  fileName?: string,
  chatId?: string
) => {
  const form = new FormData();
  form.append("file", file, fileName ?? "file");
  form.append("type", type);
  if (caption) form.append("caption", caption);
  if (chatId) form.append("chatId", chatId);
  return fetch(`${API}/api/bots/${botId}/send-media`, {
    method: "POST",
    headers: bearerHeader(),
    body: form,
  }).then((r) => r.json());
};

import type { MediaType } from "../types/bot.types";

const PROXY_URL = import.meta.env.VITE_PROXY_URL ?? "http://localhost:3000";

export const getMe = async (token: string) => {
  const res = await fetch(`${PROXY_URL}/tg/bot${token}/getMe`);
  return res.json();
};

export const getUpdates = async (token: string, offset?: number) => {
  const params = new URLSearchParams({ timeout: "0" });
  if (offset !== undefined) params.set("offset", String(offset));
  const res = await fetch(`${PROXY_URL}/tg/bot${token}/getUpdates?${params}`);
  return res.json();
};

export const sendMessage = async (token: string, chatId: string, text: string) => {
  const res = await fetch(`${PROXY_URL}/tg/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.json();
};

export const sendMedia = async (
  token: string,
  chatId: string,
  file: File | Blob,
  type: MediaType,
  caption?: string,
  fileName?: string
) => {
  const form = new FormData();
  form.append("token", token);
  form.append("chat_id", chatId);
  form.append("type", type);
  form.append("file", file, fileName ?? "file");
  if (caption) form.append("caption", caption);

  const res = await fetch(`${PROXY_URL}/tg/send-media`, {
    method: "POST",
    body: form,
  });
  return res.json();
};

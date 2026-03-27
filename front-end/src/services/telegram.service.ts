import { useAuthStore } from "../store/useAuthStore";

const API = import.meta.env.VITE_PROXY_URL ?? "http://localhost:3000";

const h = (): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${useAuthStore.getState().token}`,
});

export const tgSendCode = (phone: string) =>
  fetch(`${API}/api/tg/connect`, { method: "POST", headers: h(), body: JSON.stringify({ phone }) }).then((r) => r.json());

export const tgVerify = (pendingToken: string, code: string) =>
  fetch(`${API}/api/tg/verify`, { method: "POST", headers: h(), body: JSON.stringify({ pendingToken, code }) }).then((r) => r.json());

export const tgVerify2FA = (pendingToken: string, password: string) =>
  fetch(`${API}/api/tg/2fa`, { method: "POST", headers: h(), body: JSON.stringify({ pendingToken, password }) }).then((r) => r.json());

export const tgGetMe = () =>
  fetch(`${API}/api/tg/me`, { headers: h() }).then((r) => r.json());

export const tgDisconnect = () =>
  fetch(`${API}/api/tg/disconnect`, { method: "DELETE", headers: h() }).then((r) => r.json());

export const tgGetPanels = () =>
  fetch(`${API}/api/tg/panels`, { headers: h() }).then((r) => r.json());

export const tgAddPanel = (botUsername: string) =>
  fetch(`${API}/api/tg/panels`, { method: "POST", headers: h(), body: JSON.stringify({ botUsername }) }).then((r) => r.json());

export const tgRemovePanel = (id: number) =>
  fetch(`${API}/api/tg/panels/${id}`, { method: "DELETE", headers: h() }).then((r) => r.json());

export const tgReorderPanels = (order: { id: number; panelOrder: number }[]) =>
  fetch(`${API}/api/tg/panels/reorder`, { method: "PUT", headers: h(), body: JSON.stringify({ order }) }).then((r) => r.json());

export const tgGetMessages = (username: string, minId?: number) =>
  fetch(
    `${API}/api/tg/messages/${encodeURIComponent(username)}${minId ? `?minId=${minId}` : ""}`,
    { headers: h() }
  ).then((r) => r.json());

export const tgSendMessage = (botUsername: string, text: string) =>
  fetch(`${API}/api/tg/send`, { method: "POST", headers: h(), body: JSON.stringify({ botUsername, text }) }).then((r) => r.json());

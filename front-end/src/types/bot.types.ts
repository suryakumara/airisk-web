export interface Bot {
  id: number;
  userId?: number;
  name: string;
  token: string;
  username?: string;
  description?: string;
  chatId?: string;
  botOrder: number;
  createdAt?: string;
}

export type MediaType = "photo" | "video" | "document" | "voice";

export interface TelegramMessage {
  id: number;
  botId: number;
  updateId?: number;
  direction: "in" | "out";
  text?: string;
  mediaType?: MediaType;
  fileName?: string;
  senderName?: string;
  chatIdFrom?: string;
  // front-end only: blob URL for outgoing media preview
  mediaUrl?: string;
  timestamp: string; // ISO string from DB
}

export interface LayoutConfig {
  columns: number;
}

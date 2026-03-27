export interface TelegramAccount {
  firstName: string | null;
  username: string | null;
  phone: string | null;
}

export interface ChatPanel {
  id: number;
  botUsername: string;
  botId: string | null;
  displayName: string;
  panelOrder: number;
}

export interface ChatMessage {
  id: number;
  text: string | null;
  date: number; // unix timestamp
  out: boolean; // true = sent by me
  mediaType: "photo" | "video" | "voice" | "document" | null;
  fileName: string | null;
}

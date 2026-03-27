import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import {
  apiFetchBots,
  apiCreateBot,
  apiUpdateBot,
  apiDeleteBot,
  apiReorderBots,
} from "../services/bot.service";
import type { Bot } from "../types/bot.types";

interface BotStore {
  bots: Bot[];
  loading: boolean;
  error: string | null;
  fetchBots: () => Promise<void>;
  addBot: (data: { token: string; name: string; description?: string }) => Promise<Bot | null>;
  updateBot: (id: number, updates: { name?: string; description?: string; chatId?: string }) => Promise<void>;
  removeBot: (id: number) => Promise<void>;
  reorderBots: (activeId: number, overId: number) => void;
}

export const useBotStore = create<BotStore>()((set, get) => ({
  bots: [],
  loading: false,
  error: null,

  fetchBots: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetchBots();
      if (data.success) set({ bots: data.bots });
      else set({ error: data.message ?? "Failed to load bots." });
    } catch {
      set({ error: "Cannot reach server." });
    } finally {
      set({ loading: false });
    }
  },

  addBot: async (payload) => {
    const data = await apiCreateBot(payload);
    if (data.success) {
      set((s) => ({ bots: [...s.bots, data.bot] }));
      return data.bot as Bot;
    }
    return null;
  },

  updateBot: async (id, updates) => {
    const data = await apiUpdateBot(id, updates);
    if (data.success) {
      set((s) => ({
        bots: s.bots.map((b) => (b.id === id ? data.bot : b)),
      }));
    }
  },

  removeBot: async (id) => {
    await apiDeleteBot(id);
    set((s) => ({ bots: s.bots.filter((b) => b.id !== id) }));
  },

  reorderBots: (activeId, overId) => {
    const bots = get().bots;
    const oldIndex = bots.findIndex((b) => b.id === activeId);
    const newIndex = bots.findIndex((b) => b.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(bots, oldIndex, newIndex).map((b, i) => ({
      ...b,
      botOrder: i,
    }));
    set({ bots: reordered });

    // Persist new order to DB (fire-and-forget)
    apiReorderBots(reordered.map((b) => ({ id: b.id, botOrder: b.botOrder })));
  },
}));

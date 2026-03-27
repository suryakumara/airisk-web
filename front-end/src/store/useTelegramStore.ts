import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import { tgGetMe, tgGetPanels, tgAddPanel, tgRemovePanel, tgReorderPanels, tgDisconnect } from "../services/telegram.service";
import type { TelegramAccount, ChatPanel } from "../types/telegram.types";

interface TelegramStore {
  connected: boolean;
  account: TelegramAccount | null;
  panels: ChatPanel[];
  loading: boolean;

  fetchStatus: () => Promise<void>;
  fetchPanels: () => Promise<void>;
  addPanel: (botUsername: string) => Promise<{ success: boolean; message?: string }>;
  removePanel: (id: number) => Promise<void>;
  reorderPanels: (activeId: number, overId: number) => void;
  setConnected: (account: TelegramAccount) => void;
  disconnectAccount: () => Promise<void>;
}

export const useTelegramStore = create<TelegramStore>()((set, get) => ({
  connected: false,
  account: null,
  panels: [],
  loading: true,

  fetchStatus: async () => {
    set({ loading: true });
    try {
      const data = await tgGetMe();
      if (data.success && data.connected) {
        set({ connected: true, account: data.account });
      } else {
        set({ connected: false, account: null });
      }
    } catch {
      set({ connected: false, account: null });
    } finally {
      set({ loading: false });
    }
  },

  fetchPanels: async () => {
    const data = await tgGetPanels();
    if (data.success) set({ panels: data.panels });
  },

  addPanel: async (botUsername) => {
    const data = await tgAddPanel(botUsername);
    if (data.success) {
      set((s) => ({ panels: [...s.panels, data.panel] }));
    }
    return { success: data.success, message: data.message };
  },

  removePanel: async (id) => {
    await tgRemovePanel(id);
    set((s) => ({ panels: s.panels.filter((p) => p.id !== id) }));
  },

  reorderPanels: (activeId, overId) => {
    const panels = get().panels;
    const oldIndex = panels.findIndex((p) => p.id === activeId);
    const newIndex = panels.findIndex((p) => p.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(panels, oldIndex, newIndex).map((p, i) => ({ ...p, panelOrder: i }));
    set({ panels: reordered });
    tgReorderPanels(reordered.map((p) => ({ id: p.id, panelOrder: p.panelOrder })));
  },

  setConnected: (account) => set({ connected: true, account }),

  disconnectAccount: async () => {
    await tgDisconnect();
    set({ connected: false, account: null, panels: [] });
  },
}));

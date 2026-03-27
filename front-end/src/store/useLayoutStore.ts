import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutStore {
  columns: number;
  setColumns: (n: number) => void;
}

// Layout is a UI preference — stays in localStorage
export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      columns: 2,
      setColumns: (columns) => set({ columns }),
    }),
    { name: "airisk-layout" }
  )
);

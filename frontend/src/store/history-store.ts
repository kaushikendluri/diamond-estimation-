"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DetectionResult } from "@/types/diamond";

const MAX_HISTORY = 30;

interface HistoryState {
  results: DetectionResult[];
  addResult: (result: DetectionResult) => void;
  removeResult: (id: string) => void;
  clearHistory: () => void;
  getResult: (id: string) => DetectionResult | undefined;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      results: [],
      addResult: (result) =>
        set((state) => ({
          results: [result, ...state.results].slice(0, MAX_HISTORY),
        })),
      removeResult: (id) =>
        set((state) => ({ results: state.results.filter((r) => r.id !== id) })),
      clearHistory: () => set({ results: [] }),
      getResult: (id) => get().results.find((r) => r.id === id),
    }),
    { name: "lumina-history" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyAnswer, difficultyFor, emptyStats, itemById, nextItem } from "./engine";
import { ITEMS } from "./items";
import type { Difficulty, Item, Stats } from "./types";

type View = "play" | "stats";

type PlayState = {
  stats: Stats;
  cardId: string;
  difficulty: Difficulty;
  view: View;
  setView: (view: View) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  resolve: (item: Item, ok: boolean, via: "type" | "choice", accent: boolean) => number;
  draw: (id?: string) => void;
  reset: () => void;
};

export const usePlay = create<PlayState>()(
  persist(
    (set, get) => ({
      stats: emptyStats(),
      cardId: ITEMS[0].id,
      difficulty: "facil",
      view: "play",
      setView: (view) => set({ view }),
      setDifficulty: (difficulty) => {
        const current = itemById(get().cardId);
        if (current && difficultyFor(current) === difficulty) {
          set({ difficulty });
          return;
        }
        const next = nextItem(get().stats, [], difficulty);
        set({ difficulty, cardId: next.id, view: "play" });
      },
      resolve: (item, ok, via, accent) => {
        const { stats, points } = applyAnswer(get().stats, item, ok, via, accent);
        set({ stats });
        return points;
      },
      draw: (id) => {
        const picked = id ? itemById(id) : undefined;
        if (picked) {
          set({ cardId: picked.id, view: "play", difficulty: difficultyFor(picked) });
          return;
        }
        const next = nextItem(get().stats, [get().cardId], get().difficulty);
        set({ cardId: next.id });
      },
      reset: () => {
        const stats = emptyStats();
        set({ stats, cardId: nextItem(stats, [], get().difficulty).id, view: "play" });
      },
    }),
    {
      name: "tilde-v1",
      skipHydration: true,
      partialize: (state) => ({ stats: state.stats, cardId: state.cardId, difficulty: state.difficulty }),
    },
  ),
);

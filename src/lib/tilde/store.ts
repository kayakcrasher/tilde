import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyAnswer, difficultyFor, emptyStats, itemById, nextItem } from "./engine";
import { activate, pack } from "./lang";
import type { Difficulty, Item, Stats } from "./types";

export type View = "play" | "learn" | "speak" | "stats";

export type SpeechStats = { tries: number; perfect: number; streak: number; best: number };

const emptySpeech = (): SpeechStats => ({ tries: 0, perfect: 0, streak: 0, best: 0 });

type PlayState = {
  stats: Stats;
  speech: SpeechStats;
  cardId: string;
  difficulty: Difficulty;
  view: View;
  setView: (view: View) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  resolve: (item: Item, ok: boolean, via: "type" | "choice", accent: boolean) => number;
  draw: (id?: string) => void;
  reset: () => void;
  /** Record a speaking attempt (ratio 0-1 of words heard). Returns XP earned. */
  spoke: (ratio: number) => number;
};

export const usePlay = create<PlayState>()(
  persist(
    (set, get) => ({
      stats: emptyStats(),
      speech: emptySpeech(),
      cardId: pack().items[0].id,
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
        set({ stats, speech: emptySpeech(), cardId: nextItem(stats, [], get().difficulty).id, view: "play" });
      },
      spoke: (ratio) => {
        const perfect = ratio >= 1;
        const xp = perfect ? 8 : ratio >= 0.8 ? 4 : 0;
        const prev = get().speech ?? emptySpeech();
        const streak = perfect ? prev.streak + 1 : 0;
        set({
          speech: {
            tries: prev.tries + 1,
            perfect: prev.perfect + (perfect ? 1 : 0),
            streak,
            best: Math.max(prev.best, streak),
          },
          stats: { ...get().stats, xp: get().stats.xp + xp },
        });
        return xp;
      },
    }),
    {
      name: "tilde-v1",
      skipHydration: true,
      partialize: (state) => ({
        stats: state.stats,
        speech: state.speech,
        cardId: state.cardId,
        difficulty: state.difficulty,
      }),
    },
  ),
);

function readSaved(name: string): Partial<PlayState> {
  try {
    const raw = localStorage.getItem(name);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { state?: Partial<PlayState> };
    return parsed.state ?? {};
  } catch {
    return {};
  }
}

/**
 * Make `code` the active language: point persistence at that language's own
 * saved progress (separate per language) and load it. Saved data is read
 * before anything is written, so switching never overwrites progress.
 */
export function switchLanguage(code: string): void {
  const next = activate(code);
  const saved = readSaved(next.storageKey);
  usePlay.persist.setOptions({ name: next.storageKey });
  const fresh = emptyStats();
  const stats = saved.stats ? { ...fresh, ...saved.stats, byTense: { ...fresh.byTense, ...saved.stats.byTense } } : fresh;
  const difficulty = saved.difficulty ?? "facil";
  const card = saved.cardId ? itemById(saved.cardId) : undefined;
  const { view } = usePlay.getState();
  usePlay.setState({
    stats,
    speech: { ...emptySpeech(), ...saved.speech },
    difficulty,
    cardId: card && difficultyFor(card) === difficulty ? card.id : nextItem(stats, [], difficulty).id,
    view: view === "speak" && !next.speechLang ? "play" : view,
  });
}

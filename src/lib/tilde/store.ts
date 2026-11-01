import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyAnswer, difficultyFor, emptyStats, itemById, nextItem } from "./engine";
import { activate, pack } from "./lang";
import { emptyCard, review, type Card } from "./vocab";
import type { Difficulty, Item, Stats } from "./types";

export type View =
  | "foundations"
  | "lessons"
  | "play"
  | "learn"
  | "build"
  | "words"
  | "stories"
  | "speak"
  | "phonetics"
  | "stats"
  | "placement";

export type BuildStats = { done: number; right: number; typed: number; streak: number; best: number };

const emptyBuild = (): BuildStats => ({ done: 0, right: 0, typed: 0, streak: 0, best: 0 });

export type StoryScore = { best: number; total: number };

export type Placement = {
  right: number;
  total: number;
  level: Difficulty;
  label: string;
  byLevel: Record<Difficulty, { right: number; total: number }>;
  at: number;
};

export type SpeechStats = { tries: number; perfect: number; streak: number; best: number };

const emptySpeech = (): SpeechStats => ({ tries: 0, perfect: 0, streak: 0, best: 0 });

type PlayState = {
  stats: Stats;
  speech: SpeechStats;
  /** Best quiz score per story id. */
  stories: Record<string, StoryScore>;
  placement: Placement | null;
  /** Spaced-repetition card per vocabulary id. */
  vocab: Record<string, Card>;
  build: BuildStats;
  /** Foundations lessons finished: id → tasks right first time. */
  lessons: Record<string, number>;
  /** Lesson tree: skill id → levels completed (0-3). */
  skills: Record<string, number>;
  /** Units passed by testing out. */
  testedOut: string[];
  /** Unlocked badge id → when (ms). */
  badges: Record<string, number>;
  /** Badges unlocked this session that haven't been shown yet. */
  fresh: string[];
  cardId: string;
  difficulty: Difficulty;
  view: View;
  /** Answer by typing instead of picking from choices (remembered). */
  typeMode: boolean;
  setTypeMode: (typeMode: boolean) => void;
  setView: (view: View) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  resolve: (item: Item, ok: boolean, via: "type" | "choice", accent: boolean) => number;
  draw: (id?: string) => void;
  reset: () => void;
  /** Record a speaking attempt (ratio 0-1 of words heard). Returns XP earned. */
  spoke: (ratio: number) => number;
  /** Record a story quiz; returns XP earned (only for beating your best). */
  finishStory: (id: string, right: number, total: number) => number;
  savePlacement: (placement: Placement) => void;
  unlock: (ids: string[]) => void;
  /** Count words as seen (they came up in a sentence). */
  markSeen: (ids: string[]) => void;
  /** Record a vocabulary review; returns XP earned. */
  reviewWord: (id: string, ok: boolean) => number;
  /** Record a built sentence; returns XP earned. */
  built: (ok: boolean, typed: boolean, base: number, perfect: boolean) => number;
  finishLesson: (id: string, right: number) => void;
  /** Finish a tree lesson; returns XP earned. */
  completeSkillLesson: (skillId: string, accuracy: number) => number;
  /** Passing a test-out marks every skill up to that unit as started. */
  passTestOut: (unitId: string, skillIds: string[]) => void;
  dismissFresh: () => void;
};

export const usePlay = create<PlayState>()(
  persist(
    (set, get) => ({
      stats: emptyStats(),
      speech: emptySpeech(),
      stories: {},
      placement: null,
      vocab: {},
      build: emptyBuild(),
      lessons: {},
      skills: {},
      testedOut: [],
      badges: {},
      fresh: [],
      cardId: pack().items[0].id,
      difficulty: "facil",
      view: "play",
      typeMode: false,
      setTypeMode: (typeMode) => set({ typeMode }),
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
        set({
          stats,
          speech: emptySpeech(),
          stories: {},
          placement: null,
          vocab: {},
          build: emptyBuild(),
          lessons: {},
          skills: {},
          testedOut: [],
          badges: {},
          fresh: [],
          cardId: nextItem(stats, [], get().difficulty).id,
          view: "play",
        });
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
      finishStory: (id, right, total) => {
        const prev = get().stories[id];
        const gained = Math.max(0, right - (prev?.best ?? 0));
        const xp = gained * 5;
        set({
          stories: { ...get().stories, [id]: { best: Math.max(prev?.best ?? 0, right), total } },
          stats: { ...get().stats, xp: get().stats.xp + xp },
        });
        return xp;
      },
      savePlacement: (placement) => {
        const next = nextItem(get().stats, [], placement.level);
        set({ placement, difficulty: placement.level, cardId: next.id });
      },
      unlock: (ids) => {
        const now = Date.now();
        const badges = { ...get().badges };
        const added = ids.filter((id) => !badges[id]);
        if (added.length === 0) return;
        for (const id of added) badges[id] = now;
        set({ badges, fresh: [...get().fresh, ...added] });
      },
      dismissFresh: () => set({ fresh: get().fresh.slice(1) }),
      finishLesson: (id, right) => {
        const first = get().lessons[id] === undefined;
        set({
          lessons: { ...get().lessons, [id]: Math.max(get().lessons[id] ?? 0, right) },
          stats: first ? { ...get().stats, xp: get().stats.xp + 10 } : get().stats,
        });
      },
      completeSkillLesson: (skillId, accuracy) => {
        const level = Math.min(3, (get().skills[skillId] ?? 0) + 1);
        const xp = 10 + Math.round(accuracy * 10);
        set({ skills: { ...get().skills, [skillId]: level }, stats: { ...get().stats, xp: get().stats.xp + xp } });
        return xp;
      },
      passTestOut: (unitId, skillIds) => {
        const skills = { ...get().skills };
        for (const id of skillIds) skills[id] = Math.max(skills[id] ?? 0, 1);
        set({
          skills,
          testedOut: [...new Set([...get().testedOut, unitId])],
          stats: { ...get().stats, xp: get().stats.xp + 30 },
        });
      },
      markSeen: (ids) => {
        if (ids.length === 0) return;
        const vocab = { ...get().vocab };
        for (const id of ids) {
          const card = vocab[id] ?? emptyCard();
          vocab[id] = { ...card, seen: card.seen + 1 };
        }
        set({ vocab });
      },
      reviewWord: (id, ok) => {
        const before = get().vocab[id];
        const card = review(before, ok);
        const xp = ok ? 2 + card.box : 0;
        set({ vocab: { ...get().vocab, [id]: card }, stats: { ...get().stats, xp: get().stats.xp + xp } });
        return xp;
      },
      built: (ok, typed, base, perfect) => {
        const prev = get().build;
        const streak = ok ? prev.streak + 1 : 0;
        const xp = ok ? base * (typed ? 2 : 1) + (typed && perfect ? 3 : 0) : 0;
        set({
          build: {
            done: prev.done + 1,
            right: prev.right + (ok ? 1 : 0),
            typed: prev.typed + (ok && typed ? 1 : 0),
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
        stories: state.stories,
        placement: state.placement,
        vocab: state.vocab,
        build: state.build,
        lessons: state.lessons,
        skills: state.skills,
        testedOut: state.testedOut,
        badges: state.badges,
        cardId: state.cardId,
        difficulty: state.difficulty,
        typeMode: state.typeMode,
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
    stories: saved.stories ?? {},
    placement: saved.placement ?? null,
    vocab: saved.vocab ?? {},
    build: { ...emptyBuild(), ...saved.build },
    lessons: saved.lessons ?? {},
    skills: saved.skills ?? {},
    testedOut: saved.testedOut ?? [],
    badges: saved.badges ?? {},
    fresh: [],
    difficulty,
    typeMode: saved.typeMode ?? false,
    cardId: card && difficultyFor(card) === difficulty ? card.id : nextItem(stats, [], difficulty).id,
    view:
      next.code === "ga" && !saved.stats?.seen && !saved.lessons
        ? "foundations"
        : view === "foundations" && next.code !== "ga"
          ? "play"
          : (view === "speak" && !next.speechLang) || view === "placement"
            ? "play"
            : view,
  });
}

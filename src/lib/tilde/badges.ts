import { levelSpan } from "./engine";
import { PACKS, pack } from "./lang";
import type { BuildStats, Placement, SpeechStats, StoryScore } from "./store";
import { KNOWN_BOX, type Card } from "./vocab";
import type { Stats } from "./types";

export type BadgeState = {
  stats: Stats;
  speech: SpeechStats;
  stories: Record<string, StoryScore>;
  placement: Placement | null;
  vocab: Record<string, Card>;
  build: BuildStats;
};

function knownWords(s: BadgeState): number {
  return Object.values(s.vocab).filter((card) => card.box >= KNOWN_BOX).length;
}

export type Badge = {
  id: string;
  icon: string;
  title: string;
  /** What you have to do, shown while locked. */
  goal: string;
  earned: (s: BadgeState) => boolean;
};

/** Correct answers in tenses that live in a given band range. */
function correctInBands(s: BadgeState, min: number): number {
  const tenses = new Set(pack().items.filter((item) => item.band >= min).map((item) => item.tense));
  let total = 0;
  for (const tense of tenses) total += s.stats.byTense[tense]?.correct ?? 0;
  return total;
}

function storiesDone(s: BadgeState): number {
  return Object.values(s.stories).filter((score) => score.best > 0).length;
}

/** How many languages have any progress saved on this device. */
function languagesStarted(): number {
  let count = 0;
  for (const p of PACKS) {
    try {
      const raw = localStorage.getItem(p.storageKey);
      const seen = raw ? (JSON.parse(raw) as { state?: { stats?: { seen?: number } } }).state?.stats?.seen : 0;
      if ((seen ?? 0) > 0) count += 1;
    } catch {
      /* storage unavailable */
    }
  }
  return count;
}

export const BADGES: Badge[] = [
  { id: "first", icon: "🌱", title: "First steps", goal: "Answer your first sentence", earned: (s) => s.stats.seen >= 1 },
  { id: "answered-25", icon: "🚶", title: "Getting going", goal: "Answer 25 sentences", earned: (s) => s.stats.seen >= 25 },
  { id: "answered-100", icon: "💯", title: "Century", goal: "Answer 100 sentences", earned: (s) => s.stats.seen >= 100 },
  { id: "answered-500", icon: "🏃", title: "Marathon", goal: "Answer 500 sentences", earned: (s) => s.stats.seen >= 500 },
  { id: "streak-5", icon: "🔥", title: "On a roll", goal: "Get 5 right in a row", earned: (s) => s.stats.best >= 5 },
  { id: "streak-15", icon: "⚡", title: "Unstoppable", goal: "Get 15 right in a row", earned: (s) => s.stats.best >= 15 },
  { id: "streak-30", icon: "👑", title: "Legend", goal: "Get 30 right in a row", earned: (s) => s.stats.best >= 30 },
  {
    id: "sharp",
    icon: "🎯",
    title: "Sharpshooter",
    goal: "90% accuracy over 50+ answers",
    earned: (s) => s.stats.seen >= 50 && s.stats.correct / s.stats.seen >= 0.9,
  },
  { id: "typist", icon: "⌨️", title: "Keyboard warrior", goal: "Type 25 answers correctly", earned: (s) => s.stats.typed >= 25 },
  { id: "level-5", icon: "⭐", title: "Rising star", goal: "Reach level 5", earned: (s) => levelSpan(s.stats.xp).level >= 5 },
  { id: "level-10", icon: "🌟", title: "Nearly fluent", goal: "Reach level 10", earned: (s) => levelSpan(s.stats.xp).level >= 10 },
  {
    id: "deep-end",
    icon: "🌊",
    title: "Deep end",
    goal: "Get 25 Hard sentences right",
    earned: (s) => correctInBands(s, 5) >= 25,
  },
  {
    id: "all-rounder",
    icon: "🧭",
    title: "All-rounder",
    goal: "Answer 10 in every tense",
    earned: (s) => pack().tenses.every((t) => (s.stats.byTense[t]?.seen ?? 0) >= 10),
  },
  {
    id: "master",
    icon: "🏅",
    title: "Tense master",
    goal: "80%+ over 30 answers in one tense",
    earned: (s) => Object.values(s.stats.byTense).some((t) => t.seen >= 30 && t.correct / t.seen >= 0.8),
  },
  { id: "speak-1", icon: "🎙️", title: "First words", goal: "Say a sentence perfectly", earned: (s) => s.speech.perfect >= 1 },
  { id: "speak-10", icon: "🗣️", title: "Smooth talker", goal: "Say 10 sentences perfectly", earned: (s) => s.speech.perfect >= 10 },
  { id: "story-1", icon: "📖", title: "Bookworm", goal: "Finish a short story quiz", earned: (s) => storiesDone(s) >= 1 },
  {
    id: "story-perfect",
    icon: "🧠",
    title: "Full marks",
    goal: "Get every question right on a story",
    earned: (s) => Object.values(s.stories).some((score) => score.total > 0 && score.best === score.total),
  },
  {
    id: "story-all",
    icon: "📚",
    title: "Library card",
    goal: "Finish every story",
    earned: (s) => pack().stories.length > 0 && storiesDone(s) >= pack().stories.length,
  },
  { id: "build-10", icon: "🧩", title: "Wordsmith", goal: "Build 10 sentences correctly", earned: (s) => s.build.right >= 10 },
  { id: "build-typed", icon: "✍️", title: "Free writer", goal: "Type 10 whole sentences correctly", earned: (s) => s.build.typed >= 10 },
  { id: "vocab-25", icon: "🧠", title: "Word collector", goal: "Know 25 words", earned: (s) => knownWords(s) >= 25 },
  { id: "vocab-100", icon: "📒", title: "Walking dictionary", goal: "Know 100 words", earned: (s) => knownWords(s) >= 100 },
  { id: "placement", icon: "🧪", title: "Know thyself", goal: "Take the placement test", earned: (s) => s.placement !== null },
  { id: "bilingual", icon: "🌍", title: "Bilingual", goal: "Practise two languages", earned: () => languagesStarted() >= 2 },
  { id: "polyglot", icon: "🗺️", title: "Polyglot", goal: "Practise all three languages", earned: () => languagesStarted() >= 3 },
];

export function badgeById(id: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === id);
}

/** Ids of every badge the state currently qualifies for. */
export function earnedBadges(s: BadgeState): string[] {
  return BADGES.filter((badge) => {
    try {
      return badge.earned(s);
    } catch {
      return false;
    }
  }).map((badge) => badge.id);
}

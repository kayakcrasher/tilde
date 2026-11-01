import { pack } from "./lang";
import type { VocabEntry } from "./types";

/** Spaced-repetition state for one word. */
export type Card = {
  /** 0 = only seen in sentences, 1-5 = Leitner box. */
  box: number;
  /** When the next review is due (ms). */
  due: number;
  right: number;
  wrong: number;
  /** Times the word has come up in Play / Build. */
  seen: number;
};

export type WordStatus = "new" | "learning" | "known";

const DAY = 24 * 60 * 60 * 1000;
/** Days until the next review after reaching each box. */
export const INTERVAL_DAYS = [0, 1, 3, 7, 16, 35];
/** A word is "known" once you've recalled it on this many spaced reviews in a row. */
export const KNOWN_BOX = 3;

export function emptyCard(): Card {
  return { box: 0, due: 0, right: 0, wrong: 0, seen: 0 };
}

export function statusOf(card: Card | undefined): WordStatus {
  if (!card || card.box === 0) return "new";
  return card.box >= KNOWN_BOX ? "known" : "learning";
}

export function isDue(card: Card | undefined, now = Date.now()): boolean {
  return Boolean(card && card.box > 0 && card.due <= now);
}

/** Move a card after a review: right → next box, wrong → back to box 1 (due again soon). */
export function review(card: Card | undefined, ok: boolean, now = Date.now()): Card {
  const prev = card ?? emptyCard();
  if (!ok) return { ...prev, box: 1, due: now + 10 * 60 * 1000, wrong: prev.wrong + 1 };
  const box = Math.min(5, prev.box + 1);
  return { ...prev, box, due: now + INTERVAL_DAYS[box] * DAY, right: prev.right + 1 };
}

const cache = new Map<string, Map<string, string[]>>();

/** token (lower-case) → vocab ids, for the active language. */
function index(): Map<string, string[]> {
  const p = pack();
  const hit = cache.get(p.code);
  if (hit) return hit;
  const map = new Map<string, string[]>();
  const add = (token: string, id: string) => {
    const key = token.toLowerCase();
    const list = map.get(key) ?? [];
    if (!list.includes(id)) list.push(id);
    map.set(key, list);
  };
  for (const entry of p.vocab) {
    add(entry.word, entry.id);
    for (const form of entry.forms ?? []) add(form, entry.id);
    if (entry.kind === "verb") {
      for (const row of Object.values(p.forms[entry.word] ?? {})) for (const form of row ?? []) add(form, entry.id);
    }
  }
  cache.set(p.code, map);
  return map;
}

export function tokens(text: string): string[] {
  return (text.toLowerCase().replace(/’/g, "'").match(/[\p{L}'-]+/gu) ?? []).map((t) => t.replace(/^['-]+|['-]+$/g, ""));
}

/** Vocabulary ids that appear in a piece of text. */
export function wordsIn(text: string): string[] {
  const idx = index();
  const out = new Set<string>();
  for (const t of tokens(text)) for (const id of idx.get(t) ?? []) out.add(id);
  return [...out];
}

export function entryById(id: string): VocabEntry | undefined {
  return pack().vocab.find((entry) => entry.id === id);
}

/** A sentence from the course that uses this word, for context. */
export function exampleFor(entry: VocabEntry, sentences: { text: string; en: string }[]): { text: string; en: string } | undefined {
  const idx = index();
  return sentences.find((s) => tokens(s.text).some((t) => idx.get(t)?.includes(entry.id)));
}

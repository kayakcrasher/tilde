import { pack } from "./lang";
import type { Difficulty, Item, Row, Stats, Tense, TenseStat } from "./types";

export const TYPE_POINTS: Record<Difficulty, number> = { facil: 10, medio: 14, dificil: 20 };
export const CHOICE_POINTS: Record<Difficulty, number> = { facil: 4, medio: 6, dificil: 8 };
export const ACCENT_BONUS = 3;

const emptyTense = (): TenseStat => ({ seen: 0, correct: 0 });

export function emptyStats(): Stats {
  const byTense = {} as Record<Tense, TenseStat>;
  for (const tense of pack().tenses) byTense[tense] = emptyTense();
  return {
    xp: 0,
    streak: 0,
    best: 0,
    seen: 0,
    correct: 0,
    typed: 0,
    picked: 0,
    byTense,
    misses: [],
  };
}

export function rowOf(verb: string, tense: Tense): Row | undefined {
  return pack().forms[verb]?.[tense];
}

export function answerOf(item: Item): string {
  if (item.answer) return item.answer;
  const row = rowOf(item.verb, item.tense);
  if (!row) throw new Error(`Missing form ${item.verb} ${item.tense}`);
  return row[item.person];
}

/** Every verb that has a table for this tense, alphabetically. */
export function verbsFor(tense: Tense): string[] {
  const forms = pack().forms;
  return Object.keys(forms)
    .filter((verb) => forms[verb]?.[tense])
    .sort((a, b) => a.localeCompare(b, pack().code));
}

/** Normalize apostrophes so d’ól and d'ól compare equal. */
function cleanQuotes(value: string): string {
  return value.replace(/[’‘`´]/g, "'");
}

export function fold(value: string): string {
  return cleanQuotes(value)
    .trim()
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/['\s]+/g, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function gradeTyped(input: string, answer: string): { ok: boolean; accent: boolean } {
  if (!fold(input) || fold(input) !== fold(answer)) return { ok: false, accent: false };
  const exact = (v: string) => cleanQuotes(v).trim().toLowerCase().replace(/\s+/g, " ");
  return { ok: true, accent: exact(input) === exact(answer) };
}

export function difficultyFor(item: Item): Difficulty {
  if (item.band <= 2) return "facil";
  if (item.band <= 4) return "medio";
  return "dificil";
}

export function pointsFor(via: "type" | "choice", accent: boolean, streak: number, difficulty: Difficulty): number {
  const base = via === "type" ? TYPE_POINTS[difficulty] : CHOICE_POINTS[difficulty];
  return base + (via === "type" && accent ? ACCENT_BONUS : 0) + Math.min(streak, 6);
}

export function levelFor(xp: number): number {
  let level = 1;
  let need = 40;
  let rest = xp;
  while (rest >= need && level < 12) {
    rest -= need;
    level += 1;
    need += 25;
  }
  return level;
}

export function levelSpan(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let need = 40;
  let rest = xp;
  while (rest >= need && level < 12) {
    rest -= need;
    level += 1;
    need += 25;
  }
  return { level, into: level >= 12 ? need : rest, need };
}

export function bandFor(xp: number): Item["band"] {
  return Math.min(6, levelFor(xp)) as Item["band"];
}

export function itemById(id: string): Item | undefined {
  return pack().items.find((item) => item.id === id);
}

export function choicesFor(item: Item): string[] {
  const answer = answerOf(item);
  const same = rowOf(item.verb, item.tense) ?? [];
  const pool = [...same].filter((form) => fold(form) !== fold(answer));
  const extra: string[] = [];
  const table = pack().forms[item.verb] ?? {};
  for (const tense of pack().tenses) {
    for (const form of table[tense] ?? []) {
      if (fold(form) !== fold(answer)) extra.push(form);
    }
  }
  const tailored = (pack().distractors?.(item, answer) ?? []).filter((form) => fold(form) !== fold(answer));
  const unique = [...new Set([...tailored, ...pool, ...extra])];
  const picked = unique.slice(0, 3);
  return shuffle([answer, ...picked], item.id);
}

function shuffle(values: string[], seed: string): string[] {
  const copy = [...values];
  let n = 0;
  for (let i = 0; i < seed.length; i += 1) n = (n * 33 + seed.charCodeAt(i)) >>> 0;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    n = (n * 1664525 + 1013904223) >>> 0;
    const j = n % (i + 1);
    const swap = copy[i];
    copy[i] = copy[j] ?? copy[i];
    copy[j] = swap;
  }
  return copy;
}

export function nextItem(stats: Stats, avoid: string[], difficulty: Difficulty): Item {
  const items = pack().items;
  const open = items.filter((item) => difficultyFor(item) === difficulty && !avoid.includes(item.id));
  const pool = open.length > 0 ? open : items.filter((item) => difficultyFor(item) === difficulty);
  const bag: Item[] = [];
  for (const item of pool) {
    const weight = stats.misses.includes(item.id) ? 4 : 1;
    for (let i = 0; i < weight; i += 1) bag.push(item);
  }
  const index = Math.floor(Math.random() * bag.length);
  return bag[index] ?? items[0];
}

export function countFor(difficulty: Difficulty): number {
  return pack().items.filter((item) => difficultyFor(item) === difficulty).length;
}

/** True when the missing verb opens the sentence (or a ¿…? / ¡…! clause). */
export function atSentenceStart(item: Item): boolean {
  return !item.before || pack().openers.test(item.before);
}

export function capitalize(word: string): string {
  // Irish d' forms capitalize after the apostrophe's letter: d'ól → D'ól.
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function joinParts(item: Item, gap: string): string {
  const left = !item.before ? "" : pack().openers.test(item.before) ? item.before : `${item.before} `;
  const tail = !item.after ? "" : /^[,.?;!:]/.test(item.after) ? item.after : ` ${item.after}`;
  return `${left}${gap}${tail}`.trim();
}

/** The sentence pieces around the gap, spaced correctly for display. */
export function parts(item: Item): { left: string; tail: string } {
  const left = !item.before ? "" : pack().openers.test(item.before) ? item.before : `${item.before} `;
  const tail = !item.after ? "" : /^[,.?;!:]/.test(item.after) ? item.after : ` ${item.after}`;
  return { left, tail };
}

export function sentence(item: Item, filled?: string): string {
  const gap = filled === undefined ? "___" : atSentenceStart(item) ? capitalize(filled) : filled;
  return joinParts(item, gap);
}

export function applyAnswer(
  stats: Stats,
  item: Item,
  ok: boolean,
  via: "type" | "choice",
  accent: boolean,
): { stats: Stats; points: number } {
  const tense = stats.byTense[item.tense] ?? emptyTense();
  const nextTense = { seen: tense.seen + 1, correct: tense.correct + (ok ? 1 : 0) };
  if (!ok) {
    return {
      points: 0,
      stats: {
        ...stats,
        streak: 0,
        seen: stats.seen + 1,
        byTense: { ...stats.byTense, [item.tense]: nextTense },
        misses: [item.id, ...stats.misses.filter((id) => id !== item.id)].slice(0, 12),
      },
    };
  }
  const streak = stats.streak + 1;
  const points = pointsFor(via, accent, streak, difficultyFor(item));
  return {
    points,
    stats: {
      ...stats,
      xp: stats.xp + points,
      streak,
      best: Math.max(stats.best, streak),
      seen: stats.seen + 1,
      correct: stats.correct + 1,
      typed: stats.typed + (via === "type" ? 1 : 0),
      picked: stats.picked + (via === "choice" ? 1 : 0),
      byTense: { ...stats.byTense, [item.tense]: nextTense },
      misses: stats.misses.filter((id) => id !== item.id),
    },
  };
}

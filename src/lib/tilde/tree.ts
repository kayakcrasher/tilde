// The lesson course: each language's hand-written beginner units (packs/*/course.ts)
// turned into lessons that teach each phrase first, then practise it.
import { fold, rowOf } from "./engine";
import { pack } from "./lang";
import type { CourseLesson, CourseUnit, Item, Phrase } from "./types";

// ---------- word-tile helpers (shared with Build) ----------

/** Split a sentence into word tiles, dropping punctuation (¿ ¡ , . ? ! ;). */
export function wordsOf(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/^[¿¡"“«(]+|[,.;:!?"”»)]+$/g, ""))
    .filter(Boolean);
}

/** Compare word by word; `ok` ignores case/accents, `exact` needs every mark. */
export function gradeWords(given: string[], target: string[]): { ok: boolean; exact: boolean } {
  if (given.length !== target.length) return { ok: false, exact: false };
  const ok = given.every((w, i) => fold(w) === fold(target[i]));
  const exact = ok && given.every((w, i) => w.toLowerCase().replace(/’/g, "'") === target[i].toLowerCase().replace(/’/g, "'"));
  return { ok, exact };
}

export function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Two or three wrong tiles: other forms of the verb, plus a stray word. */
export function distractorsFor(item: Item, words: string[]): string[] {
  const taken = new Set(words.map((w) => w.toLowerCase()));
  const out: string[] = [];
  for (const form of rowOf(item.verb, item.tense) ?? []) {
    if (out.length >= 2) break;
    if (!taken.has(form.toLowerCase()) && !out.includes(form)) out.push(form);
  }
  const others = pack().items;
  for (let tries = 0; tries < 20 && out.length < 3; tries += 1) {
    const other = others[Math.floor(Math.random() * others.length)];
    const ws = wordsOf(other.before + " " + other.after).filter((w) => w.length > 2 && !taken.has(w.toLowerCase()));
    if (ws.length) {
      const w = ws[Math.floor(Math.random() * ws.length)];
      if (!out.includes(w)) out.push(w);
    }
  }
  return out;
}

// ---------- course ----------

export type FlatLesson = CourseLesson & { unit: CourseUnit; unitIndex: number; index: number };

const flatCache = new Map<string, FlatLesson[]>();

/** Every lesson in order, with its unit attached. */
export function lessonsInOrder(): FlatLesson[] {
  const p = pack();
  const hit = flatCache.get(p.code);
  if (hit) return hit;
  const out: FlatLesson[] = [];
  p.course.forEach((unit, unitIndex) => unit.lessons.forEach((l) => out.push({ ...l, unit, unitIndex, index: out.length })));
  flatCache.set(p.code, out);
  return out;
}

export type Exercise =
  | { kind: "tip"; title: string; text: string }
  | { kind: "intro"; p: Phrase }
  /** See (and hear) the phrase, pick its meaning. */
  | { kind: "pick-en"; p: Phrase; options: string[] }
  /** See the meaning, pick the phrase — as picture cards when every option has a picture. */
  | { kind: "pick-t"; p: Phrase; options: Phrase[]; pics: boolean }
  /** Build the phrase from word tiles. */
  | { kind: "tiles-t"; p: Phrase; target: string[]; bank: string[] }
  /** Build the English meaning from word tiles. */
  | { kind: "tiles-en"; p: Phrase; target: string[]; bank: string[] }
  /** Hear it, pick what was said. */
  | { kind: "listen"; p: Phrase; options: Phrase[] }
  | { kind: "match"; pairs: Phrase[] };

export const isTeaching = (e: Exercise) => e.kind === "tip" || e.kind === "intro";

function pick<T>(list: T[], n: number): T[] {
  return shuffle(list).slice(0, n);
}

const lc = (s: string) => s.toLowerCase().replace(/[¿?¡!.,]/g, "").trim();

/** Phrases for wrong options: this lesson first, then earlier ones, then the rest of the course. */
function poolFor(index: number): Phrase[] {
  const all = lessonsInOrder();
  const here = all[index].phrases;
  const before = all.slice(0, index).flatMap((l) => l.phrases);
  const after = all.slice(index + 1).flatMap((l) => l.phrases);
  return [...shuffle(here), ...shuffle(before), ...shuffle(after)];
}

function others(p: Phrase, pool: Phrase[], n: number, needPic = false): Phrase[] {
  const out: Phrase[] = [];
  for (const q of pool) {
    if (out.length >= n) break;
    if (needPic && !q.pic) continue;
    if (lc(q.en) === lc(p.en) || lc(q.t) === lc(p.t)) continue;
    if (out.some((o) => lc(o.en) === lc(q.en) || lc(o.t) === lc(q.t) || (needPic && o.pic === q.pic))) continue;
    if (needPic && q.pic === p.pic) continue;
    out.push(q);
  }
  return out;
}

function pickEn(p: Phrase, pool: Phrase[]): Exercise {
  return { kind: "pick-en", p, options: shuffle([p, ...others(p, pool, 3)]).map((q) => q.en) };
}

function pickT(p: Phrase, pool: Phrase[]): Exercise {
  if (p.pic) {
    const withPics = others(p, pool, 3, true);
    if (withPics.length === 3) return { kind: "pick-t", p, options: shuffle([p, ...withPics]), pics: true };
  }
  return { kind: "pick-t", p, options: shuffle([p, ...others(p, pool, 3)]), pics: false };
}

function tileBank(target: string[], from: string[]): string[] {
  const taken = new Set(target.map((w) => w.toLowerCase()));
  const extra: string[] = [];
  for (const w of shuffle(from)) {
    if (extra.length >= Math.max(2, Math.min(4, target.length))) break;
    if (!taken.has(w.toLowerCase()) && !extra.some((x) => x.toLowerCase() === w.toLowerCase())) extra.push(w);
  }
  return shuffle([...target, ...extra]);
}

function tilesT(p: Phrase, pool: Phrase[]): Exercise | null {
  const target = wordsOf(p.t);
  if (target.length < 2) return null;
  return { kind: "tiles-t", p, target, bank: tileBank(target, pool.flatMap((q) => wordsOf(q.t))) };
}

function tilesEn(p: Phrase, pool: Phrase[]): Exercise | null {
  const target = wordsOf(p.en);
  if (target.length < 2) return null;
  return { kind: "tiles-en", p, target, bank: tileBank(target, pool.flatMap((q) => wordsOf(q.en))) };
}

function listen(p: Phrase, pool: Phrase[]): Exercise {
  return { kind: "listen", p, options: shuffle([p, ...others(p, pool, 2)]) };
}

function matchOf(phrases: Phrase[]): Exercise | null {
  const pairs: Phrase[] = [];
  for (const p of shuffle(phrases)) {
    if (pairs.length >= 5) break;
    if (!pairs.some((q) => lc(q.en) === lc(p.en) || lc(q.t) === lc(p.t))) pairs.push(p);
  }
  return pairs.length >= 3 ? { kind: "match", pairs } : null;
}

function earlierOf(index: number): Phrase[] {
  return lessonsInOrder()
    .slice(0, index)
    .flatMap((l) => l.phrases);
}

/** One practice exercise for a phrase; `turn` rotates through the kinds. */
function practise(p: Phrase, pool: Phrase[], turn: number, voice: boolean): Exercise {
  const kinds = ["tiles-t", "pick-t", "tiles-en", voice ? "listen" : "pick-en", "pick-en"];
  for (let k = 0; k < kinds.length; k += 1) {
    const kind = kinds[(turn + k) % kinds.length];
    const e =
      kind === "tiles-t" ? tilesT(p, pool) : kind === "tiles-en" ? tilesEn(p, pool) : kind === "pick-t" ? pickT(p, pool) : kind === "listen" ? listen(p, pool) : pickEn(p, pool);
    if (e) return e;
  }
  return pickEn(p, pool);
}

/**
 * A lesson. First time: a tip, then each phrase is introduced and checked
 * straight away, then everything is practised together with a little review.
 * Practise again: no introductions, more building from tiles.
 */
export function makeLesson(index: number, replay: boolean, voice: boolean): Exercise[] {
  const lesson = lessonsInOrder()[index];
  const pool = poolFor(index);
  const ps = lesson.phrases;
  const out: Exercise[] = [];
  if (!replay) {
    if (lesson.tip) out.push({ kind: "tip", title: lesson.title, text: lesson.tip });
    ps.forEach((p, i) => {
      out.push({ kind: "intro", p });
      // After every two new phrases, a quick check on both.
      if (i % 2 === 1 || i === ps.length - 1) {
        const fresh = ps.slice(i % 2 === 1 ? i - 1 : i, i + 1);
        // Wrong options come from what's been taught so far where possible.
        const taught = [...shuffle(ps.slice(0, i + 1)), ...shuffle(earlierOf(index)), ...pool];
        fresh.forEach((q, k) => out.push((i + k) % 2 === 0 ? pickEn(q, taught) : pickT(q, taught)));
      }
    });
  }
  const practice: Exercise[] = [];
  shuffle(ps).forEach((p, i) => practice.push(practise(p, pool, i + (replay ? 0 : 1), voice)));
  if (replay) shuffle(ps).slice(0, 3).forEach((p, i) => practice.push(practise(p, pool, i + 2, voice)));
  // A little review from earlier lessons.
  const earlier = earlierOf(index);
  pick(earlier, replay ? 3 : 2).forEach((p, i) => practice.push(practise(p, pool, i, voice)));
  const m = matchOf(ps);
  const mixed = shuffle(practice);
  if (m) mixed.splice(Math.floor(mixed.length / 2), 0, m);
  return [...out, ...mixed];
}

/** A test-out: 12 questions from every unit up to and including this one. */
export function makeTestOut(unitIndex: number, voice: boolean): Exercise[] {
  const all = lessonsInOrder();
  const upTo = all.filter((l) => l.unitIndex <= unitIndex);
  const recent = upTo.filter((l) => l.unitIndex === unitIndex);
  const out: Exercise[] = [];
  const used = new Set<string>();
  for (let i = 0; out.length < 12 && i < 80; i += 1) {
    const lesson = (i % 3 === 2 ? pick(upTo, 1) : pick(recent, 1))[0];
    const p = pick(lesson.phrases, 1)[0];
    if (used.has(p.t)) continue;
    used.add(p.t);
    out.push(practise(p, poolFor(lesson.index), Math.floor(Math.random() * 5), voice));
  }
  return out;
}

/** Text to say out loud for an exercise (the phrase being learned), if any. */
export function phraseOf(e: Exercise): Phrase | null {
  return "p" in e ? e.p : null;
}

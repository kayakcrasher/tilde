// The lesson tree: units (one tense each, split into parts), skills (small
// groups of verbs) and generated exercise sessions. Built from each language
// pack's data, so every language gets its own tree.
import { answerOf, choicesFor, difficultyFor, fold, rowOf, sentence } from "./engine";
import { pack } from "./lang";
import type { Difficulty, Item, VocabEntry } from "./types";

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

// ---------- curriculum ----------

export type Skill = { id: string; tense: string; verbs: string[]; title: string };
export type Unit = { id: string; tense: string; title: string; subtitle: string; level: Difficulty; skills: Skill[] };

const VERBS_PER_SKILL = 5;
const SKILLS_PER_UNIT = 6;
export const LEVELS_PER_SKILL = 3;

const cache = new Map<string, Unit[]>();

/** Units in teaching order: each tense, split into parts of up to six skills. */
export function curriculum(): Unit[] {
  const p = pack();
  const hit = cache.get(p.code);
  if (hit) return hit;
  const units: Unit[] = [];
  const tenses = [...p.tenses].sort((a, b) => minBand(a) - minBand(b));
  for (const tense of tenses) {
    const counts = new Map<string, number>();
    for (const item of p.items) if (item.tense === tense) counts.set(item.verb, (counts.get(item.verb) ?? 0) + 1);
    const verbs = [...counts.keys()].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b));
    const skills: Skill[] = [];
    for (let i = 0; i < verbs.length; i += VERBS_PER_SKILL) {
      const group = verbs.slice(i, i + VERBS_PER_SKILL);
      if (group.length < 3 && skills.length) skills[skills.length - 1].verbs.push(...group);
      else skills.push({ id: `${tense}:${group[0]}`, tense, verbs: group, title: "" });
    }
    for (const s of skills) s.title = s.verbs.slice(0, 3).join(" · ") + (s.verbs.length > 3 ? " …" : "");
    // Split into parts of up to six skills; a tiny leftover joins the part before.
    const chunks: Skill[][] = [];
    for (let i = 0; i < skills.length; i += SKILLS_PER_UNIT) chunks.push(skills.slice(i, i + SKILLS_PER_UNIT));
    if (chunks.length > 1 && chunks[chunks.length - 1].length < 3) chunks[chunks.length - 2].push(...chunks.pop()!);
    const level = difficultyFor(p.items.find((it) => it.tense === tense)!);
    chunks.forEach((slice, k) => {
      units.push({
        id: `${tense}#${k + 1}`,
        tense,
        title: p.tenseTitle(tense) + (chunks.length > 1 ? ` · ${k + 1}` : ""),
        subtitle: p.guides[tense]?.english ?? "",
        level,
        skills: slice,
      });
    });
  }
  cache.set(p.code, units);
  return units;
}

function minBand(tense: string): number {
  return Math.min(...pack().items.filter((it) => it.tense === tense).map((it) => it.band));
}

// ---------- exercises ----------

export type Exercise =
  | { kind: "cloze"; item: Item; options: string[]; typed: boolean }
  | { kind: "conjugate"; verb: string; tense: string; person: number; answer: string; options: string[] }
  | { kind: "meaning"; entry: VocabEntry; options: string[]; reverse: boolean }
  | { kind: "match"; pairs: { word: string; en: string }[] }
  | { kind: "build"; item: Item; target: string[]; bank: string[] }
  | { kind: "listen"; item: Item; text: string; options: string[] };

function pick<T>(list: T[], n: number): T[] {
  return shuffle(list).slice(0, n);
}

function verbEntry(verb: string): VocabEntry | undefined {
  return pack().vocab.find((v) => v.kind === "verb" && v.word === verb);
}

function meaningOptions(entry: VocabEntry, reverse: boolean): string[] {
  const pool = shuffle(pack().vocab.filter((v) => v.kind === entry.kind && v.en !== entry.en && v.word !== entry.word));
  const wrong: VocabEntry[] = [];
  for (const v of pool) {
    if (wrong.length >= 3) break;
    if (!wrong.some((w) => w.en === v.en || w.word === v.word)) wrong.push(v);
  }
  return shuffle([entry, ...wrong]).map((v) => (reverse ? v.word : v.en));
}

function conjugate(verb: string, tense: string): Exercise | null {
  const row = rowOf(verb, tense);
  if (!row) return null;
  const persons = shuffle([0, 1, 2, 3, 4, 5]);
  for (const person of persons) {
    const answer = row[person];
    const others = [...new Set(row.filter((f) => fold(f) !== fold(answer)))];
    if (others.length >= 3) return { kind: "conjugate", verb, tense, person, answer, options: shuffle([answer, ...pick(others, 3)]) };
  }
  return null;
}

function build(item: Item): Exercise | null {
  const target = wordsOf(sentence(item, answerOf(item)));
  if (target.length > 9) return null;
  return { kind: "build", item, target, bank: shuffle([...target, ...distractorsFor(item, target)]) };
}

function listen(item: Item, pool: Item[]): Exercise {
  const text = sentence(item, answerOf(item));
  const others = pick(pool.filter((it) => it.id !== item.id), 2).map((it) => sentence(it, answerOf(it)));
  return { kind: "listen", item, text, options: shuffle([text, ...others]) };
}

/** A lesson for a skill at a level (0-based): about 12 mixed exercises. */
export function makeLesson(skill: Skill, level: number, voice: boolean): Exercise[] {
  const p = pack();
  const items = p.items.filter((it) => it.tense === skill.tense && skill.verbs.includes(it.verb));
  const tenseItems = p.items.filter((it) => it.tense === skill.tense);
  const out: Exercise[] = [];
  const clozeItems = pick(items, level >= 1 ? 4 : 3);
  clozeItems.forEach((item, i) => out.push({ kind: "cloze", item, options: choicesFor(item), typed: level >= 2 && i === 0 }));
  for (const verb of pick(skill.verbs, 2)) {
    const c = conjugate(verb, skill.tense);
    if (c) out.push(c);
  }
  const entries = skill.verbs.map(verbEntry).filter((e): e is VocabEntry => Boolean(e));
  pick(entries, 2).forEach((entry, i) => out.push({ kind: "meaning", entry, options: meaningOptions(entry, i === 1), reverse: i === 1 }));
  if (entries.length >= 3) out.push({ kind: "match", pairs: pick(entries, Math.min(4, entries.length)).map((e) => ({ word: e.word, en: e.en })) });
  for (const item of pick(items, 4)) {
    if (out.filter((e) => e.kind === "build").length >= 2) break;
    const b = build(item);
    if (b) out.push(b);
  }
  if (voice && items.length) out.push(listen(pick(items, 1)[0], tenseItems));
  // Top up with more gap-fills if a small skill came out short.
  for (const item of pick(tenseItems, 12)) {
    if (out.length >= 12) break;
    if (!out.some((e) => (e.kind === "cloze" || e.kind === "build") && e.item.id === item.id))
      out.push({ kind: "cloze", item, options: choicesFor(item), typed: false });
  }
  // Start gently with recognition, then mix.
  const first: Exercise[] = out.filter((e) => e.kind === "meaning" || e.kind === "cloze").slice(0, 1);
  return [...first, ...shuffle(out.filter((e) => !first.includes(e)))];
}

/** A test-out: 15 questions drawn from every unit up to and including this one. */
export function makeTestOut(unitIndex: number, voice: boolean): Exercise[] {
  const units = curriculum().slice(0, unitIndex + 1);
  const skills = units.flatMap((u) => u.skills);
  const recent = units[units.length - 1].skills;
  const out: Exercise[] = [];
  for (let i = 0; out.length < 15 && i < 60; i += 1) {
    // Weight the unit being tested.
    const skill = (i % 3 === 2 ? pick(skills, 1) : pick(recent, 1))[0];
    const lesson = makeLesson(skill, 1, voice).filter((e) => e.kind !== "match");
    const e = lesson[Math.floor(Math.random() * lesson.length)];
    if (e && !out.some((x) => JSON.stringify(x) === JSON.stringify(e))) out.push(e);
  }
  return out;
}

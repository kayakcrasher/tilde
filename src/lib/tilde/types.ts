export const TENSES = [
  "presente",
  "pretérito",
  "imperfecto",
  "futuro",
  "condicional",
  "subjuntivo",
] as const;

export type Tense = (typeof TENSES)[number];

export const PERSONS = ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"] as const;

export type Person = 0 | 1 | 2 | 3 | 4 | 5;

export const DIFFICULTIES = ["facil", "medio", "dificil"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export type Row = readonly [string, string, string, string, string, string];

export type Item = {
  id: string;
  verb: string;
  tense: Tense;
  person: Person;
  before: string;
  after: string;
  en: string;
  band: 1 | 2 | 3 | 4 | 5 | 6;
};

export type TenseStat = { seen: number; correct: number };

export type Stats = {
  xp: number;
  streak: number;
  best: number;
  seen: number;
  correct: number;
  typed: number;
  picked: number;
  byTense: Record<Tense, TenseStat>;
  misses: string[];
};

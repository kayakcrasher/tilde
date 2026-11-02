/** A tense key as used by a language pack (e.g. "presente", "Präteritum", "caite"). */
export type Tense = string;

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
  /** Exact form in this sentence when it differs from the table (e.g. Irish mutations). */
  answer?: string;
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

export type Guide = {
  tense: Tense;
  title: string;
  english: string;
  use: string;
  build: string;
  /** Example verbs shown side by side in the endings table. */
  columns: { label: string; verb: string }[];
  /** Short note under the endings table. */
  tableNote: string;
  watch: { label: string; detail: string }[];
};

export type Forms = Record<string, Partial<Record<Tense, Row>>>;

export type StoryQuestion = {
  /** Asked in English so it tests understanding, not grammar. */
  q: string;
  options: [string, string, string, string];
  /** Index of the correct option. */
  answer: 0 | 1 | 2 | 3;
};

export type VocabEntry = {
  id: string;
  /** Dictionary form shown to the learner (infinitive for verbs). */
  word: string;
  en: string;
  kind: "verb" | "word";
  /** Lower-case spellings that count as this word (verbs use their tables). */
  forms?: string[];
};

export type Story = {
  id: string;
  title: string;
  level: Difficulty;
  /** The story in the target language. */
  text: string;
  /** English translation. */
  en: string;
  questions: StoryQuestion[];
};

/** One thing a lesson teaches: a word or short phrase. */
export type Phrase = {
  /** The phrase in the language being learned. */
  t: string;
  /** Plain English meaning (used for tiles, so keep it to simple words). */
  en: string;
  /** A picture (emoji) for picture questions. */
  pic?: string;
  /** Word-for-word English, when the language builds it differently. */
  lit?: string;
  /** A short extra note shown when the phrase is introduced. */
  note?: string;
};

export type CourseLesson = { id: string; title: string; tip?: string; phrases: Phrase[] };
export type CourseUnit = { id: string; title: string; about: string; lessons: CourseLesson[] };

export type Pack = {
  code: "es" | "de" | "ga";
  /** English name of the language. */
  name: string;
  /** Name in the language itself. */
  native: string;
  /** localStorage key for this language's progress. */
  storageKey: string;
  persons: readonly string[];
  tenses: readonly Tense[];
  tenseTitle: (tense: Tense) => string;
  levels: Record<Difficulty, { native: string; help: string }>;
  forms: Forms;
  items: Item[];
  stories: Story[];
  vocab: VocabEntry[];
  guides: Record<Tense, Guide>;
  /** The beginner lesson course (Lessons tab). */
  course: CourseUnit[];
  accentKeys: readonly string[];
  /** What a missing diacritic is called: accent, umlaut, fada. */
  markWord: string;
  /** Optional "work in progress" notice shown while this language is selected. */
  notice?: { title: string; body: string };
  /** BCP-47 language for speech; undefined = no speech features. */
  speechLang?: string;
  /** Letters that, at the end of `before`, mean the gap starts a sentence (e.g. ¿ ¡). */
  openers: RegExp;
  isIrregular: (verb: string, tense: Tense, person: number) => boolean;
  /** Split a form into [unchanged part, highlighted ending] for the endings table. */
  split: (verb: string, tense: Tense, form: string) => [string, string];
  /** Optional wrong answers tailored to an item (e.g. plausible wrong participles). */
  distractors?: (item: Item, answer: string) => string[];
  /** How a form reads in a conjugation table, e.g. "hat gegessen" or "glanann tú". */
  display: (verb: string, tense: Tense, person: number, form: string) => string;
};

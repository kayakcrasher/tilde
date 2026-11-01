import type { Guide, Row, Tense } from "../../types";

type SpanishGuide = Omit<Guide, "columns" | "tableNote"> & {
  endings: { ar: Row; er: Row; ir: Row };
  /** true when endings attach to the whole infinitive (futuro, condicional). */
  onInfinitive?: boolean;
};

const same = (row: Row) => ({ ar: row, er: row, ir: row });

const RAW: Record<string, SpanishGuide> = {
  presente: {
    tense: "presente",
    title: "Presente",
    english: "I speak · I'm speaking",
    use: "Things happening now, habits, and general truths. Spanish also uses it for near plans: “Te llamo mañana.”",
    build: "Drop -ar / -er / -ir and add the ending.",
    endings: {
      ar: ["o", "as", "a", "amos", "áis", "an"],
      er: ["o", "es", "e", "emos", "éis", "en"],
      ir: ["o", "es", "e", "imos", "ís", "en"],
    },
    watch: [
      { label: "Stem changes", detail: "e→ie (pienso), o→ue (duermo), e→i (pido). Never in nosotros / vosotros." },
      { label: "Irregular yo", detail: "tengo, hago, pongo, salgo, vengo, digo, conozco, sé, doy, veo." },
      { label: "Fully irregular", detail: "ser (soy, eres, es…), ir (voy, vas, va…), estar (estoy, estás…)." },
    ],
  },
  pretérito: {
    tense: "pretérito",
    title: "Pretérito",
    english: "I spoke · I ate",
    use: "Finished actions at a specific moment: ayer, anoche, el año pasado, en 2019.",
    build: "Drop the ending and add these. -er and -ir share the same set.",
    endings: {
      ar: ["é", "aste", "ó", "amos", "asteis", "aron"],
      er: ["í", "iste", "ió", "imos", "isteis", "ieron"],
      ir: ["í", "iste", "ió", "imos", "isteis", "ieron"],
    },
    watch: [
      { label: "Strong stems, no accents", detail: "tuve, estuve, hice, puse, pude, quise, vine, supe, dije, traje." },
      { label: "ser = ir", detail: "fui, fuiste, fue, fuimos, fuisteis, fueron — context tells them apart." },
      { label: "Spelling in yo", detail: "llegué, busqué, empecé, pagué, toqué — to keep the sound." },
      { label: "-ir stem changes", detail: "Only in él / ellos: pidió, durmió, sintió, siguieron." },
    ],
  },
  imperfecto: {
    tense: "imperfecto",
    title: "Imperfecto",
    english: "I used to speak · I was speaking",
    use: "Background, descriptions and habits in the past: de niño, siempre, cada verano, mientras…",
    build: "Drop the ending and add these. -er and -ir share the same set.",
    endings: {
      ar: ["aba", "abas", "aba", "ábamos", "abais", "aban"],
      er: ["ía", "ías", "ía", "íamos", "íais", "ían"],
      ir: ["ía", "ías", "ía", "íamos", "íais", "ían"],
    },
    watch: [
      { label: "Only three irregulars", detail: "ser → era, ir → iba, ver → veía." },
      { label: "Pretérito vs imperfecto", detail: "“Leía (background) cuando sonó (event) el teléfono.”" },
    ],
  },
  futuro: {
    tense: "futuro",
    title: "Futuro",
    english: "I will speak",
    use: "What will happen. Also guesses about now: “Serán las diez” — it must be about ten.",
    build: "Keep the whole infinitive and add the ending. Same endings for every verb.",
    endings: same(["é", "ás", "á", "emos", "éis", "án"]),
    onInfinitive: true,
    watch: [
      {
        label: "Irregular stems",
        detail: "tendr-, pondr-, saldr-, vendr-, podr-, sabr-, querr-, har-, dir- (+ é, ás, á…).",
      },
    ],
  },
  condicional: {
    tense: "condicional",
    title: "Condicional",
    english: "I would speak",
    use: "What would happen, polite requests (“¿Podrías…?”), and advice (“Yo que tú, iría”).",
    build: "Keep the whole infinitive and add the imperfect -ía endings.",
    endings: same(["ía", "ías", "ía", "íamos", "íais", "ían"]),
    onInfinitive: true,
    watch: [
      { label: "Same stems as futuro", detail: "tendría, pondría, saldría, vendría, podría, sabría, querría, haría, diría." },
    ],
  },
  subjuntivo: {
    tense: "subjuntivo",
    title: "Subjuntivo",
    english: "(that) I speak",
    use: "Wishes, requests, doubts and feelings after que: quiero que, espero que, ojalá, es importante que, cuando (future).",
    build: "Take the yo form of the present, drop the -o, and swap to the “opposite” vowel: -ar → e, -er / -ir → a.",
    endings: {
      ar: ["e", "es", "e", "emos", "éis", "en"],
      er: ["a", "as", "a", "amos", "áis", "an"],
      ir: ["a", "as", "a", "amos", "áis", "an"],
    },
    watch: [
      { label: "Irregular yo carries over", detail: "tengo → tenga, hago → haga, digo → diga, conozco → conozca." },
      { label: "Six to memorise", detail: "ser → sea, ir → vaya, estar → esté, saber → sepa, dar → dé, haber → haya." },
      { label: "Spelling", detail: "llegue, busque, empiece, pague — like the pretérito yo form." },
    ],
  },
};

export const TENSES = ["presente", "pretérito", "imperfecto", "futuro", "condicional", "subjuntivo"] as const;

export const EXAMPLES = { ar: "hablar", er: "comer", ir: "vivir" } as const;

export const GUIDES: Record<Tense, Guide> = Object.fromEntries(
  Object.entries(RAW).map(([tense, raw]) => [
    tense,
    {
      tense: raw.tense,
      title: raw.title,
      english: raw.english,
      use: raw.use,
      build: raw.build,
      watch: raw.watch,
      columns: (["ar", "er", "ir"] as const).map((kind) => ({ label: `-${kind}`, verb: EXAMPLES[kind] })),
      tableNote: raw.onInfinitive ? "Grey = the whole infinitive." : "Grey = the stem.",
    },
  ]),
);

export type Conjugation = "ar" | "er" | "ir";

export function conjugationOf(verb: string): Conjugation {
  const end = verb.slice(-2).normalize("NFD").replace(/\p{M}/gu, "");
  return end === "ar" ? "ar" : end === "er" ? "er" : "ir";
}

/** The form a fully regular verb would take — used to flag irregular forms. */
export function regularForm(verb: string, tense: Tense, person: number): string {
  const guide = RAW[tense];
  const kind = conjugationOf(verb);
  const stem = guide.onInfinitive ? verb : verb.slice(0, -2);
  return stem + guide.endings[kind][person];
}

/** Split a form into the part that matches the regular stem and the rest. */
export function splitForm(verb: string, tense: Tense, form: string): [string, string] {
  const stem = RAW[tense].onInfinitive ? verb : verb.slice(0, -2);
  if (form.startsWith(stem)) return [stem, form.slice(stem.length)];
  let i = 0;
  while (i < form.length && i < stem.length && form[i] === stem[i]) i += 1;
  return [form.slice(0, i), form.slice(i)];
}


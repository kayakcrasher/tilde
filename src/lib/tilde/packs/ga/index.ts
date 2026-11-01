import type { Guide, Pack, Tense } from "../../types";
import { FORMS } from "./forms";
import { ITEMS } from "./items";
import { STORIES } from "./stories";
import { VOCAB } from "./vocab";
import { IRREGULAR_VERBS, SPLIT_STEMS } from "./meta";

const TENSES = ["láithreach", "caite", "gnáthchaite", "fáistineach", "coinníollach"] as const;

const TITLES: Record<string, string> = {
  láithreach: "Aimsir Láithreach",
  caite: "Aimsir Chaite",
  gnáthchaite: "Aimsir Ghnáthchaite",
  fáistineach: "Aimsir Fháistineach",
  coinníollach: "Modh Coinníollach",
};

const PRONOUNS = ["mé", "tú", "sé", "muid", "sibh", "siad"];

const COLUMNS = [
  { label: "1st broad", verb: "glan" },
  { label: "1st slender", verb: "bris" },
  { label: "2nd broad", verb: "ceannaigh" },
  { label: "2nd slender", verb: "imigh" },
];

const GUIDES: Record<Tense, Guide> = {
  láithreach: {
    tense: "láithreach",
    title: TITLES.láithreach,
    english: "I clean (regularly)",
    use: "Things that happen regularly or are generally true. For “right now”, Irish uses bí + ag: Tá mé ag glanadh.",
    build:
      "1st conjugation (one syllable): + -aim, -ann, -aimid (broad) or -im, -eann, -imid (slender). 2nd conjugation (-aigh / -igh): -aím, -aíonn, -aímid or -ím, -íonn, -ímid.",
    columns: COLUMNS,
    tableNote: "“I” and “we” are one word; the others add a pronoun.",
    watch: [
      { label: "One word for I / we", detail: "glanaim, glanaimid — but glanann tú, glanann sé, glanann siad." },
      { label: "Ní and an", detail: "Ní lenites: ní ghlanaim. An eclipses: an nglanann tú? Vowels don't change: an ólann tú?" },
      { label: "bí", detail: "tá mé / níl mé / an bhfuil tú? / cá bhfuil…?" },
    ],
  },
  caite: {
    tense: "caite",
    title: TITLES.caite,
    english: "I cleaned",
    use: "Finished actions in the past: inné, aréir, an tseachtain seo caite.",
    build:
      "Lenite the root: glan → ghlan mé. Vowels and f take d': d'ól, d'fhan. “We” is one word: ghlanamar, bhriseamar, cheannaíomar, d'imíomar.",
    columns: COLUMNS,
    tableNote: "Lenition (h) or d' at the front; the root stays the same.",
    watch: [
      { label: "Níor and ar", detail: "Negative níor + lenition (níor ghlan), question ar (ar ghlan tú?). No d' after them: níor ól." },
      { label: "Irregular", detail: "bhí, chuaigh, rinne, chonaic, fuair, dúirt, tháinig, thug, d'ith, chuala, rug." },
      {
        label: "After ní / an",
        detail: "Some irregulars switch form: an raibh, ní dheachaigh, ní dhearna, an bhfaca, ní bhfuair.",
      },
    ],
  },
  gnáthchaite: {
    tense: "gnáthchaite",
    title: TITLES.gnáthchaite,
    english: "I used to clean",
    use: "Habits in the past — things you used to do: nuair a bhí mé óg, gach samhradh.",
    build:
      "Lenite (or d') like the past, then -ainn, -tá, -adh, -aimis, -adh, -aidís (slender -inn, -teá, -eadh…; 2nd conj. -aínn, -aíteá, -aíodh…).",
    columns: COLUMNS,
    tableNote: "I, you, we and they are one word.",
    watch: [
      { label: "Pronoun only for he / she / you all", detail: "ghlanadh sé, ghlanadh sibh — the rest are one word: ghlanainn, ghlantá." },
      { label: "With a noun", detail: "Use the -adh form: Bhíodh na siopaí dúnta (not bhídís)." },
    ],
  },
  fáistineach: {
    tense: "fáistineach",
    title: TITLES.fáistineach,
    english: "I will clean",
    use: "What will happen: amárach, an tseachtain seo chugainn, go luath.",
    build:
      "No lenition. 1st conj.: -faidh / -fidh (glanfaidh, brisfidh). 2nd conj.: -óidh / -eoidh (ceannóidh, imeoidh). “We”: -faimid, -fimid, -óimid, -eoimid.",
    columns: COLUMNS,
    tableNote: "Only “we” is one word.",
    watch: [
      {
        label: "Irregular",
        detail: "beidh, rachaidh, déanfaidh, feicfidh, gheobhaidh, déarfaidh, tiocfaidh, tabharfaidh, íosfaidh, cloisfidh, béarfaidh.",
      },
      { label: "Ní and an", detail: "ní ghlanfaidh mé, an nglanfaidh tú? — and ní bheidh, an mbeidh?" },
    ],
  },
  coinníollach: {
    tense: "coinníollach",
    title: TITLES.coinníollach,
    english: "I would clean",
    use: "What would happen. Often with dá (if) + eclipsis: dá mbeadh am agam — if I had time.",
    build:
      "Lenite (or d') + -fainn, -fá, -fadh, -faimis, -fadh, -faidís (slender -finn, -feá…; 2nd conj. -óinn / -eoinn, -ófá / -eofá…).",
    columns: COLUMNS,
    tableNote: "I, you, we and they are one word.",
    watch: [
      { label: "Questions", detail: "An + eclipsis, and d' drops: an nglanfá? an ólfá? an rachfá?" },
      { label: "Negatives", detail: "Ní + lenition: ní ghlanfainn, ní ólfainn." },
      {
        label: "Irregular",
        detail: "bheinn, rachainn, dhéanfainn, d'fheicfinn, gheobhainn, déarfainn, thiocfainn, thabharfainn, d'íosfainn.",
      },
    ],
  },
};

export const irish: Pack = {
  code: "ga",
  name: "Irish",
  native: "Gaeilge",
  storageKey: "tilde-ga-v1",
  persons: ["mé", "tú", "sé/sí", "muid", "sibh", "siad"],
  tenses: TENSES,
  tenseTitle: (tense) => TITLES[tense] ?? tense,
  levels: {
    facil: { native: "Éasca", help: "Aimsir Láithreach (present), with the verb, tense and person shown." },
    medio: { native: "Measartha", help: "Past and habitual past. You get the verb and the tense." },
    dificil: { native: "Deacair", help: "Future and conditional. No hints — go by the English." },
  },
  forms: FORMS,
  items: ITEMS,
  stories: STORIES,
  vocab: VOCAB,
  guides: GUIDES,
  accentKeys: ["á", "é", "í", "ó", "ú", "'"],
  markWord: "fada",
  notice: {
    title: "Irish is a work in progress",
    body:
      "Verb forms are checked against teanglann.ie, every word against An Gramadóir, and audio and pronunciation come from ABAIR (Phonetics and Speech Laboratory, Trinity College Dublin) — but the sentences and lessons haven't been reviewed by a fluent speaker yet, so some phrasing may sound unnatural. Only the standard written forms are taught, pronunciation lines follow the Connacht voice, audio needs an internet connection, and there's no speaking practice yet.",
  },

  speechLang: undefined,
  openers: /^$/,
  isIrregular: (verb) => IRREGULAR_VERBS.has(verb),
  split: (verb, _tense, form) => {
    for (const stem of SPLIT_STEMS[verb] ?? []) {
      if (form.startsWith(stem)) return [stem, form.slice(stem.length)];
    }
    let i = 0;
    while (i < form.length && i < verb.length && form[i] === verb[i]) i += 1;
    return [form.slice(0, i), form.slice(i)];
  },
  // Synthetic forms (one word) stand alone; analytic forms take a pronoun.
  display: (verb, tense, person, form) => {
    const row = FORMS[verb]?.[tense];
    const analytic = person === 2 || (row && form === row[2]);
    return analytic ? `${form} ${PRONOUNS[person]}` : form;
  },
};

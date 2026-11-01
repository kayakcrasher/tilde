import type { Guide, Pack, Tense } from "../../types";
import { FORMS } from "./forms";
import { ITEMS } from "./items";
import { AUX, IRREGULAR, SEPARABLE } from "./meta";

const TENSES = ["Präsens", "Präteritum", "Perfekt", "Futur", "Konjunktiv II"] as const;

const HABEN = ["habe", "hast", "hat", "haben", "habt", "haben"];
const SEIN = ["bin", "bist", "ist", "sind", "seid", "sind"];

/** Verbs with their own Konjunktiv II form (the rest use würde + infinitive). */
const OWN_KONJ = new Set(["sein", "haben", "werden", "können", "müssen", "dürfen", "sollen", "mögen", "wissen"]);

function stemOf(verb: string): string {
  const base = SEPARABLE[verb] ? verb.slice(SEPARABLE[verb].length) : verb;
  return /[^e]n$/.test(base.slice(-2)) || base.endsWith("ern") || base.endsWith("eln") ? base.slice(0, -1) : base.slice(0, -2);
}

const GUIDES: Record<Tense, Guide> = {
  Präsens: {
    tense: "Präsens",
    title: "Präsens",
    english: "I make · I'm making",
    use: "Now, habits, general truths — and very often the near future: “Morgen fahre ich nach Berlin.”",
    build: "Take the stem (drop -en) and add -e, -st, -t, -en, -t, -en.",
    columns: [
      { label: "regular", verb: "machen" },
      { label: "a → ä", verb: "fahren" },
      { label: "e → i", verb: "sprechen" },
    ],
    tableNote: "Grey = the stem.",
    watch: [
      { label: "Vowel change in du / er", detail: "Many strong verbs change only there: fahren → fährst, sprechen → sprichst, sehen → siehst." },
      { label: "Extra -e-", detail: "Stems ending in -t / -d add an e: arbeiten → du arbeitest, er arbeitet." },
      { label: "Separable verbs", detail: "The prefix goes to the end: aufstehen → Ich stehe um sechs auf." },
      { label: "Learn by heart", detail: "sein (bin, bist, ist…), haben (habe, hast, hat…), wissen (weiß), and the modals (kann, muss, will…)." },
    ],
  },
  Präteritum: {
    tense: "Präteritum",
    title: "Präteritum",
    english: "I made · I was",
    use: "The written past (stories, news). In speech it's mostly used for sein, haben and the modals: war, hatte, konnte.",
    build: "Weak verbs: stem + -te, -test, -te, -ten, -tet, -ten. Strong verbs change their vowel and add no -te.",
    columns: [
      { label: "weak", verb: "machen" },
      { label: "strong", verb: "fahren" },
      { label: "mixed", verb: "denken" },
    ],
    tableNote: "Grey = what stays the same.",
    watch: [
      { label: "ich = er", detail: "No ending in ich and er/sie/es: ich fuhr, er fuhr; ich machte, er machte." },
      { label: "Common strong stems", detail: "ging, kam, sah, aß, trank, sprach, las, schrieb, gab, nahm, fand, blieb." },
      { label: "Mixed verbs", detail: "Vowel change plus -te: denken → dachte, bringen → brachte, kennen → kannte, wissen → wusste." },
    ],
  },
  Perfekt: {
    tense: "Perfekt",
    title: "Perfekt",
    english: "I have made · I made",
    use: "The spoken past. The helper (haben or sein) sits in second place, the participle goes to the end.",
    build: "Weak: ge- + stem + -t (gemacht). Strong: ge- + changed stem + -en (gesprochen). You fill in the participle.",
    columns: [
      { label: "weak", verb: "machen" },
      { label: "strong", verb: "sprechen" },
      { label: "with sein", verb: "fahren" },
    ],
    tableNote: "Helper verb + past participle.",
    watch: [
      { label: "haben or sein?", detail: "sein for movement and change of state (gehen, fahren, kommen, werden) and for sein / bleiben. Everything else takes haben." },
      { label: "No ge-", detail: "Verbs starting be-, ver-, er-, ent-, zer- and -ieren verbs: besucht, verkauft, studiert." },
      { label: "Separable", detail: "ge- goes after the prefix: aufgestanden, eingekauft, angerufen." },
    ],
  },
  Futur: {
    tense: "Futur",
    title: "Futur I",
    english: "I will make",
    use: "Promises, predictions and plans. (German often just uses the Präsens with a time word.)",
    build: "werden (in second place) + infinitive at the end: Ich werde morgen arbeiten. You fill in the form of werden.",
    columns: [
      { label: "werden +", verb: "machen" },
      { label: "werden +", verb: "fahren" },
    ],
    tableNote: "werden + infinitive.",
    watch: [
      { label: "werden is irregular", detail: "ich werde, du wirst, er wird, wir werden, ihr werdet, sie werden." },
      { label: "Not “will” = wollen", detail: "Ich will = I want to. Ich werde = I will." },
    ],
  },
  "Konjunktiv II": {
    tense: "Konjunktiv II",
    title: "Konjunktiv II",
    english: "I would · I could · If I had…",
    use: "Wishes, polite requests, advice and unreal situations: “Könntest du…?”, “Ich hätte gern…”, “Wenn ich Zeit hätte…”.",
    build: "Most verbs: würde + infinitive. A few common verbs have their own form, usually with an umlaut.",
    columns: [
      { label: "haben", verb: "haben" },
      { label: "sein", verb: "sein" },
      { label: "würde +", verb: "machen" },
    ],
    tableNote: "hätte / wäre, or würde + infinitive.",
    watch: [
      { label: "Own forms", detail: "wäre, hätte, könnte, müsste, dürfte, sollte, möchte, wüsste." },
      { label: "Polite", detail: "Ich hätte gern… = I'd like…; Könnten Sie…? = Could you…?" },
      { label: "Conditional", detail: "Wenn ich reich wäre, würde ich reisen. — If I were rich, I'd travel." },
    ],
  },
};

export const german: Pack = {
  code: "de",
  name: "German",
  native: "Deutsch",
  storageKey: "tilde-de-v1",
  persons: ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"],
  tenses: TENSES,
  tenseTitle: (tense) => (tense === "Futur" ? "Futur I" : tense),
  levels: {
    facil: { native: "Leicht", help: "Präsens (present), with the verb, tense and person shown." },
    medio: { native: "Mittel", help: "Präteritum and Perfekt (past participle). You get the verb and the tense." },
    dificil: { native: "Schwer", help: "Futur I and Konjunktiv II. No hints — go by the English." },
  },
  forms: FORMS,
  items: ITEMS,
  guides: GUIDES,
  accentKeys: ["ä", "ö", "ü", "ß"],
  markWord: "umlaut",
  speechLang: "de-DE",
  openers: /^$/,
  distractors: (item, answer) => {
    if (item.tense !== "Perfekt") return [];
    const particle = SEPARABLE[item.verb] ?? "";
    const stem = stemOf(item.verb);
    const ge = /^(be|ver|er|ent|emp|zer|ge|miss)/.test(item.verb.slice(particle.length)) ? "" : "ge";
    const past = FORMS[item.verb]?.["Präteritum"]?.[2] ?? "";
    const strongPast = past && !past.endsWith("e") ? past : "";
    const wrong = [
      `${particle}${ge}${stem}t`, // weak pattern on a strong verb: geschlaft
      `${particle}${ge}${stem}en`, // strong pattern on a weak verb: gemachen
      strongPast ? `${particle}${ge}${strongPast}en` : "", // past vowel: gesahen
      ge ? "" : `${particle}ge${answer.slice(particle.length)}`, // extra ge-: gebesucht
      `${particle}${stem}t`, // forgot ge-: macht
    ].filter(Boolean);
    return [...new Set(wrong)].filter((w) => w !== answer && w.length > 2).slice(0, 3);
  },
  isIrregular: (verb, tense, person) => IRREGULAR[verb]?.[tense]?.includes(person) ?? false,
  split: (verb, _tense, form) => {
    const stem = stemOf(verb);
    if (form.startsWith(stem)) return [stem, form.slice(stem.length)];
    let i = 0;
    while (i < form.length && i < stem.length && form[i] === stem[i]) i += 1;
    return [form.slice(0, i), form.slice(i)];
  },
  display: (verb, tense, person, form) => {
    const particle = SEPARABLE[verb];
    if (tense === "Perfekt") return `${(AUX[verb] === "sein" ? SEIN : HABEN)[person]} ${form}`;
    if (tense === "Futur") return `${form} ${verb}`;
    if (tense === "Konjunktiv II" && !OWN_KONJ.has(verb)) return `${form} ${verb}`;
    return particle ? `${form} … ${particle}` : form;
  },
};

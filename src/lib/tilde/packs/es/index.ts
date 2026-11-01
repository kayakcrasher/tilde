import type { Pack } from "../../types";
import { FORMS } from "./forms";
import { GUIDES, TENSES, regularForm, splitForm } from "./guides";
import { ITEMS } from "./items";
import { STORIES } from "./stories";

export const spanish: Pack = {
  code: "es",
  name: "Spanish",
  native: "Español",
  storageKey: "tilde-v1",
  persons: ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"],
  tenses: TENSES,
  tenseTitle: (tense) => tense.charAt(0).toUpperCase() + tense.slice(1),
  levels: {
    facil: { native: "Fácil", help: "Present tense, with the verb, tense and person shown." },
    medio: { native: "Medio", help: "Preterite and imperfect. You get the verb and the tense." },
    dificil: { native: "Difícil", help: "Future, conditional and subjunctive. No hints — go by the English." },
  },
  forms: FORMS,
  items: ITEMS,
  stories: STORIES,
  guides: GUIDES,
  accentKeys: ["á", "é", "í", "ó", "ú", "ü", "ñ"],
  markWord: "accent",
  speechLang: "es-ES",
  openers: /[¿¡]$/,
  isIrregular: (verb, tense, person) => FORMS[verb]?.[tense]?.[person] !== regularForm(verb, tense, person),
  split: splitForm,
  display: (_verb, _tense, _person, form) => form,
};

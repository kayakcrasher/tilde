import type { Row, Tense } from "./types";

export const FORMS: Record<string, Partial<Record<Tense, Row>>> = {
  hablar: {
    presente: ["hablo", "hablas", "habla", "hablamos", "habláis", "hablan"],
    pretérito: ["hablé", "hablaste", "habló", "hablamos", "hablasteis", "hablaron"],
    imperfecto: ["hablaba", "hablabas", "hablaba", "hablábamos", "hablabais", "hablaban"],
    futuro: ["hablaré", "hablarás", "hablará", "hablaremos", "hablaréis", "hablarán"],
    condicional: ["hablaría", "hablarías", "hablaría", "hablaríamos", "hablaríais", "hablarían"],
    subjuntivo: ["hable", "hables", "hable", "hablemos", "habléis", "hablen"],
  },
  comer: {
    presente: ["como", "comes", "come", "comemos", "coméis", "comen"],
    pretérito: ["comí", "comiste", "comió", "comimos", "comisteis", "comieron"],
    imperfecto: ["comía", "comías", "comía", "comíamos", "comíais", "comían"],
  },
  vivir: {
    presente: ["vivo", "vives", "vive", "vivimos", "vivís", "viven"],
    pretérito: ["viví", "viviste", "vivió", "vivimos", "vivisteis", "vivieron"],
    imperfecto: ["vivía", "vivías", "vivía", "vivíamos", "vivíais", "vivían"],
    futuro: ["viviré", "vivirás", "vivirá", "viviremos", "viviréis", "vivirán"],
  },
  trabajar: {
    presente: ["trabajo", "trabajas", "trabaja", "trabajamos", "trabajáis", "trabajan"],
  },
  estudiar: {
    presente: ["estudio", "estudias", "estudia", "estudiamos", "estudiáis", "estudian"],
  },
  ser: {
    presente: ["soy", "eres", "es", "somos", "sois", "son"],
    pretérito: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
    imperfecto: ["era", "eras", "era", "éramos", "erais", "eran"],
    futuro: ["seré", "serás", "será", "seremos", "seréis", "serán"],
    condicional: ["sería", "serías", "sería", "seríamos", "seríais", "serían"],
    subjuntivo: ["sea", "seas", "sea", "seamos", "seáis", "sean"],
  },
  estar: {
    presente: ["estoy", "estás", "está", "estamos", "estáis", "están"],
    pretérito: ["estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron"],
    imperfecto: ["estaba", "estabas", "estaba", "estábamos", "estabais", "estaban"],
    futuro: ["estaré", "estarás", "estará", "estaremos", "estaréis", "estarán"],
    subjuntivo: ["esté", "estés", "esté", "estemos", "estéis", "estén"],
  },
  ir: {
    presente: ["voy", "vas", "va", "vamos", "vais", "van"],
    pretérito: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
    imperfecto: ["iba", "ibas", "iba", "íbamos", "ibais", "iban"],
    condicional: ["iría", "irías", "iría", "iríamos", "iríais", "irían"],
    futuro: ["iré", "irás", "irá", "iremos", "iréis", "irán"],
    subjuntivo: ["vaya", "vayas", "vaya", "vayamos", "vayáis", "vayan"],
  },
  tener: {
    presente: ["tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen"],
    pretérito: ["tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis", "tuvieron"],
    imperfecto: ["tenía", "tenías", "tenía", "teníamos", "teníais", "tenían"],
    futuro: ["tendré", "tendrás", "tendrá", "tendremos", "tendréis", "tendrán"],
    condicional: ["tendría", "tendrías", "tendría", "tendríamos", "tendríais", "tendrían"],
    subjuntivo: ["tenga", "tengas", "tenga", "tengamos", "tengáis", "tengan"],
  },
  hacer: {
    presente: ["hago", "haces", "hace", "hacemos", "hacéis", "hacen"],
    pretérito: ["hice", "hiciste", "hizo", "hicimos", "hicisteis", "hicieron"],
    imperfecto: ["hacía", "hacías", "hacía", "hacíamos", "hacíais", "hacían"],
    futuro: ["haré", "harás", "hará", "haremos", "haréis", "harán"],
    condicional: ["haría", "harías", "haría", "haríamos", "haríais", "harían"],
    subjuntivo: ["haga", "hagas", "haga", "hagamos", "hagáis", "hagan"],
  },
  poder: {
    presente: ["puedo", "puedes", "puede", "podemos", "podéis", "pueden"],
    imperfecto: ["podía", "podías", "podía", "podíamos", "podíais", "podían"],
    pretérito: ["pude", "pudiste", "pudo", "pudimos", "pudisteis", "pudieron"],
    futuro: ["podré", "podrás", "podrá", "podremos", "podréis", "podrán"],
    condicional: ["podría", "podrías", "podría", "podríamos", "podríais", "podrían"],
    subjuntivo: ["pueda", "puedas", "pueda", "podamos", "podáis", "puedan"],
  },
  querer: {
    presente: ["quiero", "quieres", "quiere", "queremos", "queréis", "quieren"],
    pretérito: ["quise", "quisiste", "quiso", "quisimos", "quisisteis", "quisieron"],
    imperfecto: ["quería", "querías", "quería", "queríamos", "queríais", "querían"],
    condicional: ["querría", "querrías", "querría", "querríamos", "querríais", "querrían"],
  },
  decir: {
    presente: ["digo", "dices", "dice", "decimos", "decís", "dicen"],
    imperfecto: ["decía", "decías", "decía", "decíamos", "decíais", "decían"],
    pretérito: ["dije", "dijiste", "dijo", "dijimos", "dijisteis", "dijeron"],
    subjuntivo: ["diga", "digas", "diga", "digamos", "digáis", "digan"],
  },
  ver: {
    presente: ["veo", "ves", "ve", "vemos", "veis", "ven"],
    imperfecto: ["veía", "veías", "veía", "veíamos", "veíais", "veían"],
  },
  venir: {
    presente: ["vengo", "vienes", "viene", "venimos", "venís", "vienen"],
    futuro: ["vendré", "vendrás", "vendrá", "vendremos", "vendréis", "vendrán"],
    pretérito: ["vine", "viniste", "vino", "vinimos", "vinisteis", "vinieron"],
    subjuntivo: ["venga", "vengas", "venga", "vengamos", "vengáis", "vengan"],
  },
  salir: {
    presente: ["salgo", "sales", "sale", "salimos", "salís", "salen"],
    condicional: ["saldría", "saldrías", "saldría", "saldríamos", "saldríais", "saldrían"],
    subjuntivo: ["salga", "salgas", "salga", "salgamos", "salgáis", "salgan"],
  },
  llegar: {
    presente: ["llego", "llegas", "llega", "llegamos", "llegáis", "llegan"],
    pretérito: ["llegué", "llegaste", "llegó", "llegamos", "llegasteis", "llegaron"],
    subjuntivo: ["llegue", "llegues", "llegue", "lleguemos", "lleguéis", "lleguen"],
  },
  saber: {
    presente: ["sé", "sabes", "sabe", "sabemos", "sabéis", "saben"],
    pretérito: ["supe", "supiste", "supo", "supimos", "supisteis", "supieron"],
    imperfecto: ["sabía", "sabías", "sabía", "sabíamos", "sabíais", "sabían"],
    subjuntivo: ["sepa", "sepas", "sepa", "sepamos", "sepáis", "sepan"],
  },
  pensar: {
    presente: ["pienso", "piensas", "piensa", "pensamos", "pensáis", "piensan"],
    pretérito: ["pensé", "pensaste", "pensó", "pensamos", "pensasteis", "pensaron"],
  },
  dormir: {
    presente: ["duermo", "duermes", "duerme", "dormimos", "dormís", "duermen"],
    pretérito: ["dormí", "dormiste", "durmió", "dormimos", "dormisteis", "durmieron"],
    subjuntivo: ["duerma", "duermas", "duerma", "durmamos", "durmáis", "duerman"],
  },
  pedir: {
    presente: ["pido", "pides", "pide", "pedimos", "pedís", "piden"],
    pretérito: ["pedí", "pediste", "pidió", "pedimos", "pedisteis", "pidieron"],
  },
  poner: {
    presente: ["pongo", "pones", "pone", "ponemos", "ponéis", "ponen"],
    pretérito: ["puse", "pusiste", "puso", "pusimos", "pusisteis", "pusieron"],
    subjuntivo: ["ponga", "pongas", "ponga", "pongamos", "pongáis", "pongan"],
  },
  dar: {
    presente: ["doy", "das", "da", "damos", "dais", "dan"],
    pretérito: ["di", "diste", "dio", "dimos", "disteis", "dieron"],
  },
  conocer: {
    presente: ["conozco", "conoces", "conoce", "conocemos", "conocéis", "conocen"],
  },
  jugar: {
    presente: ["juego", "juegas", "juega", "jugamos", "jugáis", "juegan"],
  },
  traer: {
    pretérito: ["traje", "trajiste", "trajo", "trajimos", "trajisteis", "trajeron"],
  },
  volver: {
    pretérito: ["volví", "volviste", "volvió", "volvimos", "volvisteis", "volvieron"],
  },
};

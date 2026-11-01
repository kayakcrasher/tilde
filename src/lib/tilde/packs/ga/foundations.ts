// An Bunús — foundations of Irish. Each example has three lines:
// the Irish, the "Irish lens" (English words in Irish order, literally),
// and natural English.

export type LensExample = { ga: string; lens: string; en: string; note?: string };

export type LessonTask =
  | { type: "choice"; q: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3 }
  | { type: "order"; en: string; ga: string; tiles: string[] };

export type Lesson = {
  id: string;
  ga: string;
  title: string;
  intro: string;
  points: string[];
  examples: LensExample[];
  tasks: LessonTask[];
  /** Sends the learner to another part of the app when done. */
  next?: { label: string; view: "learn" | "play" | "phonetics" };
};

export const LESSONS: Lesson[] = [
  {
    id: "failte",
    ga: "Fáilte",
    title: "Hello the Irish way",
    intro:
      "Irish greetings aren't word-for-word copies of English ones — they're little blessings. Notice how differently the ideas are built. That's the whole of this course in miniature: learn how Irish thinks, and the words fall into place.",
    points: [
      "“Hello” is a blessing: God to you.",
      "The reply adds to it: God and Mary to you.",
      "“Thank you” is a wish: that good may be at you.",
    ],
    examples: [
      { ga: "Dia duit.", lens: "God to-you.", en: "Hello." },
      { ga: "Dia is Muire duit.", lens: "God and Mary to-you.", en: "Hello (in reply)." },
      { ga: "Go raibh maith agat.", lens: "That may-be good at-you.", en: "Thank you." },
      { ga: "Slán.", lens: "Safe.", en: "Goodbye." },
      { ga: "Conas atá tú?", lens: "How that-is you?", en: "How are you?" },
    ],
    tasks: [
      { type: "choice", q: "What does “Dia duit” literally mean?", options: ["God to you", "Good day", "Hello friend", "Welcome home"], answer: 0 },
      { type: "choice", q: "How do you reply to “Dia duit”?", options: ["Dia is Muire duit", "Slán", "Go raibh maith agat", "Fáilte"], answer: 0 },
      { type: "order", en: "Thank you.", ga: "Go raibh maith agat.", tiles: ["That", "may-be", "good", "at-you"] },
    ],
  },
  {
    id: "verb-first",
    ga: "An briathar ar dtús",
    title: "The verb comes first",
    intro:
      "English puts the doer first: Seán drinks tea. Irish puts the action first, then who does it, then everything else: Drinks Seán tea. This one change — verb, subject, object — is the backbone of every Irish sentence.",
    points: ["Order: VERB → WHO → WHAT/WHERE/WHEN.", "Questions and statements keep the verb at the front.", "Once you expect the verb first, Irish sentences stop looking scrambled."],
    examples: [
      { ga: "Ólann Seán tae.", lens: "Drinks Seán tea.", en: "Seán drinks tea." },
      { ga: "Itheann na páistí arán.", lens: "Eat the children bread.", en: "The children eat bread." },
      { ga: "Chonaic mé madra.", lens: "Saw I dog.", en: "I saw a dog." },
      { ga: "Tá an lá go hálainn.", lens: "Is the day beautiful.", en: "The day is beautiful." },
    ],
    tasks: [
      { type: "choice", q: "In an Irish sentence, what usually comes first?", options: ["The verb", "The subject", "The object", "The time"], answer: 0 },
      { type: "order", en: "Seán drinks tea.", ga: "Ólann Seán tae.", tiles: ["Drinks", "Seán", "tea"] },
      { type: "order", en: "The children eat bread.", ga: "Itheann na páistí arán.", tiles: ["Eat", "the", "children", "bread"] },
    ],
  },
  {
    id: "two-be",
    ga: "Tá agus Is",
    title: "Two ways to “be”",
    intro:
      "English has one verb “to be”. Irish has two. Tá describes how or where something is right now. Is says what something is — its identity or category. Using the wrong one is the most common learner mistake.",
    points: ["Tá = state or place: tired, cold, at home, here.", "Is = identity or class: a teacher, Seán, Irish.", "With Is, the description comes before the person: Is teacher I."],
    examples: [
      { ga: "Tá mé tuirseach.", lens: "Am I tired.", en: "I'm tired." },
      { ga: "Tá sé fuar.", lens: "Is it cold.", en: "It's cold." },
      { ga: "Tá sí sa bhaile.", lens: "Is she in-the home.", en: "She's at home." },
      { ga: "Is múinteoir mé.", lens: "Is teacher I.", en: "I'm a teacher.", note: "Is for what you are" },
      { ga: "Is mise Seán.", lens: "Is me Seán.", en: "I'm Seán." },
    ],
    tasks: [
      { type: "choice", q: "Which verb do you use for “I'm tired”?", options: ["Tá", "Is", "Either", "Neither"], answer: 0 },
      { type: "choice", q: "Which verb do you use for “I'm a teacher”?", options: ["Is", "Tá", "Either", "Neither"], answer: 0 },
      { type: "order", en: "I'm a teacher.", ga: "Is múinteoir mé.", tiles: ["Is", "teacher", "I"] },
    ],
  },
  {
    id: "no-have",
    ga: "Tá … agam",
    title: "Irish has no “have”",
    intro:
      "There is no verb “to have” in Irish. Instead, the thing is at you. “I have a car” becomes “A car is at me”. Even languages work this way: you don't speak Irish — Irish is at you.",
    points: ["Pattern: Tá + THING + ag + PERSON.", "ag + mé merges into one word: agam (at-me).", "Níl = is not. An bhfuil…? = is…?"],
    examples: [
      { ga: "Tá carr agam.", lens: "Is car at-me.", en: "I have a car." },
      { ga: "Tá Gaeilge agam.", lens: "Is Irish at-me.", en: "I speak Irish." },
      { ga: "Níl airgead agam.", lens: "Isn't money at-me.", en: "I have no money." },
      { ga: "An bhfuil peann agat?", lens: "Is pen at-you?", en: "Do you have a pen?" },
    ],
    tasks: [
      { type: "choice", q: "“Tá carr agam” literally means…", options: ["Is car at-me", "I have car", "Car is mine", "Me car is"], answer: 0 },
      { type: "choice", q: "What does agam mean?", options: ["at me", "on me", "with me", "to me"], answer: 0 },
      { type: "order", en: "I have a car.", ga: "Tá carr agam.", tiles: ["Is", "car", "at-me"] },
    ],
  },
  {
    id: "feelings-on",
    ga: "Tá … orm",
    title: "Feelings sit on you",
    intro:
      "In Irish you aren't hungry — hunger is on you. Feelings, needs and illnesses are things that land on a person. It's a gentler, more poetic way to see yourself: the feeling passes; you remain.",
    points: ["Pattern: Tá + FEELING + ar + PERSON.", "ar + mé merges into orm (on-me), ar + tú into ort.", "Tá brón orm (sorrow is on me) is how you say sorry."],
    examples: [
      { ga: "Tá ocras orm.", lens: "Is hunger on-me.", en: "I'm hungry." },
      { ga: "Tá tart orm.", lens: "Is thirst on-me.", en: "I'm thirsty." },
      { ga: "Tá áthas orm.", lens: "Is joy on-me.", en: "I'm happy." },
      { ga: "Tá brón orm.", lens: "Is sorrow on-me.", en: "I'm sorry." },
      { ga: "Tá slaghdán orm.", lens: "Is a-cold on-me.", en: "I have a cold." },
    ],
    tasks: [
      { type: "choice", q: "How do you say “I'm hungry”?", options: ["Tá ocras orm", "Is ocras mé", "Tá mé ocras", "Ocras agam"], answer: 0 },
      { type: "choice", q: "“Tá brón orm” means…", options: ["I'm sorry", "I'm hungry", "I'm cold", "I'm late"], answer: 0 },
      { type: "order", en: "I'm thirsty.", ga: "Tá tart orm.", tiles: ["Is", "thirst", "on-me"] },
    ],
  },
  {
    id: "prep-pronouns",
    ga: "Forainmneacha réamhfhoclacha",
    title: "Little words that merge",
    intro:
      "Irish glues prepositions and pronouns together: “at me” is one word, agam. You've already met agam and orm. Learn three sets — ag (at), ar (on), le (with) — and you can say a huge amount, including likes and loves: “good with me” means I like it.",
    points: [
      "ag (at): agam, agat, aige, aici, againn, agaibh, acu",
      "ar (on): orm, ort, air, uirthi, orainn, oraibh, orthu",
      "le (with): liom, leat, leis, léi, linn, libh, leo",
      "Is maith liom… = good with-me = I like…",
    ],
    examples: [
      { ga: "Is maith liom tae.", lens: "Is good with-me tea.", en: "I like tea." },
      { ga: "Is breá liom ceol.", lens: "Is fine with-me music.", en: "I love music." },
      { ga: "Ní maith leis cáis.", lens: "Isn't good with-him cheese.", en: "He doesn't like cheese." },
      { ga: "Tá ocras uirthi.", lens: "Is hunger on-her.", en: "She's hungry." },
      { ga: "Tá teach mór acu.", lens: "Is house big at-them.", en: "They have a big house.", note: "adjectives come after the noun" },
    ],
    tasks: [
      { type: "choice", q: "What does liom mean?", options: ["with me", "at me", "on me", "to me"], answer: 0 },
      { type: "choice", q: "How do you say “I like tea”?", options: ["Is maith liom tae", "Tá tae agam", "Tá maith orm tae", "Is mé maith tae"], answer: 0 },
      { type: "order", en: "I love music.", ga: "Is breá liom ceol.", tiles: ["Is", "fine", "with-me", "music"] },
    ],
  },
  {
    id: "no-yes",
    ga: "Gan sea ná ní hea",
    title: "There's no yes or no",
    intro:
      "Irish has no single word for yes or no. You answer by repeating the verb from the question: “Are you ready?” — “Am.” or “Am-not.” It forces you to listen to the verb, which is great training.",
    points: ["Answer with the question's verb: An bhfuil…? → Tá / Níl.", "Past: Ar ól tú…? → D'ól / Níor ól.", "With is: An maith leat…? → Is maith / Ní maith."],
    examples: [
      { ga: "An bhfuil tú réidh? — Tá.", lens: "Is you ready? — Am.", en: "Are you ready? — Yes." },
      { ga: "An bhfuil ocras ort? — Níl.", lens: "Is hunger on-you? — Isn't.", en: "Are you hungry? — No." },
      { ga: "Ar ól tú an tae? — D'ól.", lens: "Did drink you the tea? — Drank.", en: "Did you drink the tea? — Yes." },
      { ga: "An maith leat é? — Is maith.", lens: "Is good with-you it? — Is good.", en: "Do you like it? — Yes." },
    ],
    tasks: [
      { type: "choice", q: "“An bhfuil tú tuirseach?” — how do you say yes?", options: ["Tá", "Sea", "Is ea", "Ceart"], answer: 0 },
      { type: "choice", q: "“Ar ól tú an tae?” — how do you say no?", options: ["Níor ól", "Níl", "Ní hea", "Tá"], answer: 0 },
      { type: "order", en: "Are you ready?", ga: "An bhfuil tú réidh?", tiles: ["Is", "you", "ready?"] },
    ],
  },
  {
    id: "ag-ing",
    ga: "Ag + ainm briathartha",
    title: "“-ing” means “at”",
    intro:
      "To say what someone is doing right now, Irish says they are “at” the action: I am at drinking tea. The action word here (ag ól, ag obair) is a verbal noun — a noun that names the action.",
    points: ["Pattern: Tá + PERSON + ag + ACTION.", "ag ól = at drinking, ag obair = at working, ag caint = at talking.", "Change Tá to Bhí for the past: Bhí mé ag obair = I was working."],
    examples: [
      { ga: "Tá mé ag ól tae.", lens: "Am I at drinking tea.", en: "I'm drinking tea." },
      { ga: "Tá sí ag obair.", lens: "Is she at working.", en: "She's working." },
      { ga: "Bhí siad ag caint.", lens: "Were they at talking.", en: "They were talking." },
      { ga: "Tá mé ag foghlaim Gaeilge.", lens: "Am I at learning Irish.", en: "I'm learning Irish." },
    ],
    tasks: [
      { type: "choice", q: "“Tá sí ag obair” literally means…", options: ["Is she at working", "She works", "She will work", "She has work"], answer: 0 },
      { type: "order", en: "I'm drinking tea.", ga: "Tá mé ag ól tae.", tiles: ["Am", "I", "at", "drinking", "tea"] },
    ],
  },
  {
    id: "lenition",
    ga: "Séimhiú",
    title: "Lenition: softened sounds",
    intro:
      "Irish words can change their first sound to show grammar. Lenition (séimhiú) softens it, written with an h: cat → chat. It's not decoration — it carries meaning, like “my” or “his” or the past tense.",
    points: [
      "Written as h after the first letter: b c d f g m p s t → bh ch dh fh gh mh ph sh th.",
      "Triggers: mo (my), do (your), a (his), and the past tense.",
      "Calling someone: a chara! (friend!), a Sheáin! (Seán!)",
    ],
    examples: [
      { ga: "mo chat", lens: "my cat", en: "my cat", note: "cat → chat" },
      { ga: "mo theach", lens: "my house", en: "my house", note: "teach → theach" },
      { ga: "do mháthair", lens: "your mother", en: "your mother", note: "máthair → mháthair" },
      { ga: "Ghlan mé an teach.", lens: "Cleaned I the house.", en: "I cleaned the house.", note: "past tense lenites: glan → ghlan" },
      { ga: "Dia duit, a chara!", lens: "God to-you, O friend!", en: "Hello, friend!" },
    ],
    tasks: [
      { type: "choice", q: "How is lenition written?", options: ["An h after the first letter", "A letter in front of the word", "A fada", "A double letter"], answer: 0 },
      { type: "choice", q: "“my house” is…", options: ["mo theach", "mo teach", "mo dteach", "mo hteach"], answer: 0 },
      { type: "choice", q: "Which of these lenites?", options: ["mo (my)", "ár (our)", "i (in)", "an (question)"], answer: 0 },
    ],
  },
  {
    id: "eclipsis",
    ga: "Urú",
    title: "Eclipsis: covered sounds",
    intro:
      "Eclipsis (urú) is the other big change. A new letter is written in front and you say only the new sound: cat → gcat (said “gat”). Like an eclipse, the new sound covers the old one.",
    points: [
      "b→mb, c→gc, d→nd, f→bhf, g→ng, p→bp, t→dt; vowels take n-.",
      "Triggers: ár (our), bhur (your, plural), a (their), i (in), and an in questions.",
      "Say only the first letter-pair's sound: gcat = “gat”, mbád = “mawd”.",
    ],
    examples: [
      { ga: "ár gcat", lens: "our cat", en: "our cat" },
      { ga: "bhur dteach", lens: "your(pl) house", en: "your house (talking to several people)" },
      { ga: "i nGaillimh", lens: "in Galway", en: "in Galway" },
      { ga: "i mBaile Átha Cliath", lens: "in Town-of Ford-of Hurdles", en: "in Dublin" },
      { ga: "An bhfuil tú ann?", lens: "Is you there?", en: "Are you there?", note: "fuil → bhfuil" },
    ],
    tasks: [
      { type: "choice", q: "How do you say “gcat”?", options: ["gat", "kat", "g-kat", "khat"], answer: 0 },
      { type: "choice", q: "“our cat” is…", options: ["ár gcat", "ár chat", "ár cat", "ár ncat"], answer: 0 },
      { type: "choice", q: "Which of these eclipses?", options: ["i (in)", "mo (my)", "do (your)", "a (his)"], answer: 0 },
    ],
  },
  {
    id: "his-her-their",
    ga: "A, a, a",
    title: "His, her or their?",
    intro:
      "Irish uses the same little word — a — for his, her and their. The first sound of the next word tells you which one is meant. This is mutation doing real work: one letter changes the whole meaning.",
    points: ["a + lenition = HIS: a chat", "a + no change = HER: a cat", "a + eclipsis = THEIR: a gcat", "Before a vowel: a athair (his), a hathair (her), a n-athair (their)."],
    examples: [
      { ga: "a chat", lens: "his cat", en: "his cat" },
      { ga: "a cat", lens: "her cat", en: "her cat" },
      { ga: "a gcat", lens: "their cat", en: "their cat" },
      { ga: "a hathair", lens: "her father", en: "her father" },
      { ga: "a n-athair", lens: "their father", en: "their father" },
    ],
    tasks: [
      { type: "choice", q: "“a chat” means…", options: ["his cat", "her cat", "their cat", "a cat"], answer: 0 },
      { type: "choice", q: "“their cat” is…", options: ["a gcat", "a chat", "a cat", "a hcat"], answer: 0 },
      { type: "choice", q: "“a hathair” means…", options: ["her father", "his father", "their father", "a father"], answer: 0 },
    ],
  },
  {
    id: "questions",
    ga: "Ceisteanna",
    title: "Asking and saying no",
    intro:
      "Questions and negatives are made with small words in front of the verb — never by moving words around. Each little word brings its own mutation, which is why the verb's first sound changes.",
    points: ["An…? asks (eclipsis): An dtuigeann tú?", "Ní… says no (lenition): Ní thuigim.", "Past tense: Ar…? and Níor… (lenition).", "Cá…? = where (eclipsis): Cá bhfuil tú?"],
    examples: [
      { ga: "An dtuigeann tú?", lens: "Do-? understand you?", en: "Do you understand?" },
      { ga: "Ní thuigim.", lens: "Not understand-I.", en: "I don't understand." },
      { ga: "Ar ól tú é?", lens: "Did-? drink you it?", en: "Did you drink it?" },
      { ga: "Níor ól mé é.", lens: "Didn't drink I it.", en: "I didn't drink it." },
      { ga: "Cá bhfuil tú?", lens: "Where are you?", en: "Where are you?" },
    ],
    tasks: [
      { type: "choice", q: "How do you say “I don't understand”?", options: ["Ní thuigim", "Ní tuigim", "Níl tuigim", "Ní dtuigim"], answer: 0 },
      { type: "order", en: "Do you understand?", ga: "An dtuigeann tú?", tiles: ["Do-?", "understand", "you?"] },
    ],
  },
  {
    id: "one-word",
    ga: "Foirm tháite",
    title: "One word or two",
    intro:
      "Some verb forms carry the person inside them: glanaim means “I clean” in one word. Others need the pronoun after: glanann tú, “you clean”. You'll see both in every tense — learn the one-word forms as little packages.",
    points: ["Present: glanaim (I), glanaimid (we) are one word; the rest add a pronoun.", "Past: ghlanamar (we) is one word.", "Conditional: ghlanfainn (I would), ghlanfá (you would)…"],
    examples: [
      { ga: "Glanaim an teach.", lens: "Clean-I the house.", en: "I clean the house." },
      { ga: "Glanann tú an teach.", lens: "Clean you the house.", en: "You clean the house." },
      { ga: "Glanaimid an teach.", lens: "Clean-we the house.", en: "We clean the house." },
      { ga: "Ghlanamar an teach.", lens: "Cleaned-we the house.", en: "We cleaned the house." },
    ],
    tasks: [
      { type: "choice", q: "Which is one word?", options: ["glanaim", "glanann tú", "glanann sé", "glanann siad"], answer: 0 },
      { type: "order", en: "We clean the house.", ga: "Glanaimid an teach.", tiles: ["Clean-we", "the", "house"] },
    ],
  },
  {
    id: "tenses",
    ga: "Na haimsirí",
    title: "On to the tenses",
    intro:
      "You now have the foundation: verb first, two kinds of “be”, things at you and on you, answering with verbs, and mutations that carry meaning. Everything in the tenses builds on this. Practise them in Play, and look up any verb's table in Learn.",
    points: [
      "Aimsir Láithreach — present: glanaim (I clean)",
      "Aimsir Chaite — past: ghlan mé (I cleaned)",
      "Aimsir Ghnáthchaite — used to: ghlanainn",
      "Aimsir Fháistineach — future: glanfaidh mé",
      "Modh Coinníollach — would: ghlanfainn",
    ],
    examples: [
      { ga: "Ghlan mé an teach inné.", lens: "Cleaned I the house yesterday.", en: "I cleaned the house yesterday." },
      { ga: "Glanfaidh mé an teach amárach.", lens: "Will-clean I the house tomorrow.", en: "I'll clean the house tomorrow." },
    ],
    tasks: [{ type: "choice", q: "Which is the past tense?", options: ["Ghlan mé", "Glanfaidh mé", "Glanaim", "Ghlanfainn"], answer: 0 }],
    next: { label: "Open the tense guides", view: "learn" },
  },
];

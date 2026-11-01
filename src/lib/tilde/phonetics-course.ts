// "The sounds of speech" — an IPA crash course that works across languages.

export type Lang = "en" | "es" | "de" | "ga";

export type Example = { lang: Lang; word: string; ipa?: string; en?: string; note?: string };

export type SymbolRow = { sym: string; name: string; examples: Example[] };

export type Block =
  | { type: "text"; body: string }
  | { type: "tip"; body: string }
  | { type: "symbols"; title?: string; rows: SymbolRow[] }
  | { type: "examples"; title?: string; rows: Example[] }
  | { type: "mouth" }
  | { type: "vowels" }
  | { type: "respell" }
  | { type: "dialect" };

export type QuizQ = { q: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3 };

export type Chapter = { id: string; title: string; blurb: string; blocks: Block[]; quiz: QuizQ[]; lang?: Lang };

export const CHAPTERS: Chapter[] = [
  {
    id: "why",
    title: "Why spelling lies",
    blurb: "One symbol, one sound — the idea behind the IPA.",
    blocks: [
      {
        type: "text",
        body: "English spelling is a poor guide to sound: “ough” is said differently in though, through, tough, cough and bough. Irish, German and Spanish have their own rules, and they don't match English ones. The International Phonetic Alphabet (IPA) fixes this with one rule: every symbol stands for exactly one sound, in every language.",
      },
      {
        type: "text",
        body: "Dictionaries write IPA between slashes or brackets. /kat/ is how a word is pronounced in principle; [kʰat] shows fine detail. In Tilde we use slashes and keep things practical.",
      },
      {
        type: "examples",
        title: "Same letters, different sounds",
        rows: [
          { lang: "en", word: "though", ipa: "ðoʊ" },
          { lang: "en", word: "through", ipa: "θɹuː" },
          { lang: "en", word: "tough", ipa: "tʌf" },
          { lang: "es", word: "jamón", ipa: "xaˈmon", en: "ham — j is a throaty sound" },
          { lang: "de", word: "ich", ipa: "ɪç", en: "I — ch is a soft hiss" },
          { lang: "ga", word: "bhád", en: "boat (after 'his') — bh sounds like w" },
        ],
      },
      {
        type: "tip",
        body: "You don't need to memorise the whole IPA. About 40 symbols cover Spanish, German and Irish. This course teaches just those.",
      },
    ],
    quiz: [
      { q: "What is the main rule of the IPA?", options: ["One symbol = one sound", "One letter = one syllable", "Symbols follow English spelling", "Every word gets a number"], answer: 0 },
      { q: "In IPA, what do slashes like /kat/ show?", options: ["How the word is pronounced", "That the word is a verb", "A spelling mistake", "The word's stress only"], answer: 0 },
      { q: "Why learn IPA for Irish?", options: ["Its spelling follows its own rules, not English ones", "Irish has no spelling", "Irish is written in IPA", "It isn't useful for Irish"], answer: 0 },
    ],
  },
  {
    id: "mouth",
    title: "Your mouth map",
    blurb: "Where sounds are made, and how.",
    blocks: [
      { type: "text", body: "Every consonant is described by three things: where in the mouth it's made (place), how the air is shaped (manner), and whether your voice is on (voicing)." },
      { type: "mouth" },
      {
        type: "text",
        body: "Voicing: put your fingers on your throat and say “sss” then “zzz”. You feel a buzz on z — that's your vocal cords. s and z are made in the same place in the same way; only voicing differs. The same is true of f/v, p/b, t/d, k/g.",
      },
      {
        type: "symbols",
        title: "Manners — how the air is shaped",
        rows: [
          { sym: "p t k", name: "Stops — air fully blocked, then released", examples: [{ lang: "en", word: "pat" }] },
          { sym: "f s x", name: "Fricatives — air squeezed through a gap, so it hisses", examples: [{ lang: "en", word: "fish" }] },
          { sym: "m n ŋ", name: "Nasals — air goes out through the nose", examples: [{ lang: "en", word: "sing" }] },
          { sym: "l j w", name: "Approximants — the tongue gets close but doesn't hiss", examples: [{ lang: "en", word: "yellow" }] },
          { sym: "ɾ r", name: "Tap and trill — one flick, or a roll", examples: [{ lang: "es", word: "pero", ipa: "ˈpeɾo" }, { lang: "es", word: "perro", ipa: "ˈpero" }] },
        ],
      },
    ],
    quiz: [
      { q: "What's the only difference between s and z?", options: ["Voicing — z has the buzz", "Place — z is made at the lips", "z goes through the nose", "There is no difference"], answer: 0 },
      { q: "Which sounds send air through the nose?", options: ["m n ŋ", "p t k", "f s x", "l j w"], answer: 0 },
      { q: "What is a fricative?", options: ["Air squeezed through a narrow gap, making a hiss", "Air fully blocked then released", "A rolled r", "A vowel"], answer: 0 },
    ],
  },
  {
    id: "consonants",
    title: "Consonants",
    blurb: "The symbols you'll meet in Spanish, German and Irish.",
    blocks: [
      { type: "text", body: "Many symbols look like normal letters and sound as you'd expect: p b t d k ɡ m n f v s z l h. Here are the ones that surprise English speakers. Tap any word to hear it." },
      {
        type: "symbols",
        title: "Hisses and soft sounds",
        rows: [
          { sym: "ʃ", name: "“sh”", examples: [{ lang: "en", word: "ship" }, { lang: "de", word: "Schule", ipa: "ˈʃuːlə" }, { lang: "ga", word: "sí", en: "she" }] },
          { sym: "θ", name: "“th” in thin", examples: [{ lang: "en", word: "thin" }, { lang: "es", word: "cielo", ipa: "ˈθjelo", note: "Spain" }] },
          { sym: "ð", name: "“th” in this — soft", examples: [{ lang: "en", word: "this" }, { lang: "es", word: "cada", ipa: "ˈkaða" }] },
          { sym: "x", name: "throaty h, like Scottish “loch”", examples: [{ lang: "es", word: "jamón", ipa: "xaˈmon" }, { lang: "de", word: "Buch", ipa: "buːx" }, { lang: "ga", word: "chat", en: "cat (after 'his')" }] },
          { sym: "ç", name: "soft hiss, like “h” in huge said firmly", examples: [{ lang: "de", word: "ich", ipa: "ɪç" }, { lang: "ga", word: "cheol", en: "music (after 'his')" }] },
          { sym: "ɣ", name: "a “g” that never closes — a voiced loch sound", examples: [{ lang: "es", word: "agua", ipa: "ˈaɣwa" }, { lang: "ga", word: "dhoras", en: "door (after 'his')" }] },
          { sym: "β", name: "a “b” with lips not quite closed", examples: [{ lang: "es", word: "bebé", ipa: "beˈβe" }] },
        ],
      },
      {
        type: "symbols",
        title: "Nasals, r-sounds and glides",
        rows: [
          { sym: "ŋ", name: "“ng” in sing", examples: [{ lang: "en", word: "sing" }, { lang: "de", word: "lang", ipa: "laŋ" }] },
          { sym: "ɲ", name: "“ny” in canyon", examples: [{ lang: "es", word: "niño", ipa: "ˈniɲo" }] },
          { sym: "ɾ", name: "a single quick tap of the tongue", examples: [{ lang: "es", word: "pero", ipa: "ˈpeɾo" }, { lang: "ga", word: "rí", en: "king" }] },
          { sym: "r", name: "a rolled, trilled r", examples: [{ lang: "es", word: "perro", ipa: "ˈpero" }] },
          { sym: "ʁ", name: "a throaty French-style r", examples: [{ lang: "de", word: "rot", ipa: "ʁoːt" }] },
          { sym: "j", name: "“y” in yes (not the English j!)", examples: [{ lang: "en", word: "yes" }, { lang: "de", word: "ja", ipa: "jaː" }] },
          { sym: "ʔ", name: "glottal stop — the catch in “uh-oh”", examples: [{ lang: "de", word: "beachten", ipa: "bəˈʔaxtn̩" }] },
          { sym: "ts", name: "“ts” in cats, at the start of a word", examples: [{ lang: "de", word: "Zeit", ipa: "tsaɪ̯t" }] },
        ],
      },
    ],
    quiz: [
      { q: "Which symbol is the “y” sound in “yes”?", options: ["j", "y", "ʝ", "ɟ"], answer: 0 },
      { q: "German Buch and Spanish jamón share which sound?", options: ["x", "ʃ", "h", "k"], answer: 0 },
      { q: "Spanish pero vs perro: what changes?", options: ["Tap ɾ vs rolled r", "Voicing", "Stress", "Nothing"], answer: 0 },
      { q: "Which symbol is “ng” as in sing?", options: ["ŋ", "ɲ", "n", "ɳ"], answer: 0 },
    ],
  },
  {
    id: "vowels",
    title: "Vowels",
    blurb: "A map of the tongue: high or low, front or back, round or spread.",
    blocks: [
      { type: "text", body: "Vowels are described by where the tongue is highest (front ↔ back), how high it is (close ↔ open), and whether the lips are rounded. The chart below is a map of your mouth, facing left. Tap a vowel to hear it in a word." },
      { type: "vowels" },
      {
        type: "text",
        body: "The most common vowel in Irish, German and English is ə, the “schwa” — a lazy “uh” in unstressed syllables, like the a in about. German ɐ is a similar sound used for -er endings.",
      },
      { type: "tip", body: "y, ʏ, ø and œ are “front rounded” vowels: say ee or eh, then round your lips without moving your tongue. That's German ü and ö." },
    ],
    quiz: [
      { q: "What is the schwa?", options: ["ə — a relaxed “uh”", "a long ee", "a rolled r", "a nasal vowel"], answer: 0 },
      { q: "How do you make German ü (y)?", options: ["Say “ee”, then round your lips", "Say “oo” through your nose", "Say “u” with a hiss", "Say “i” very quickly"], answer: 0 },
      { q: "On the vowel chart, “close” means…", options: ["The tongue is high", "The mouth is shut", "The vowel is short", "The vowel is stressed"], answer: 0 },
    ],
  },
  {
    id: "marks",
    title: "Marks: stress, length, broad & slender",
    blurb: "The little symbols that change everything.",
    blocks: [
      {
        type: "symbols",
        rows: [
          { sym: "ˈ", name: "Primary stress — goes before the stressed syllable", examples: [{ lang: "es", word: "casa", ipa: "ˈkasa" }] },
          { sym: "ˌ", name: "Secondary stress — weaker", examples: [{ lang: "en", word: "understand", ipa: "ˌʌndəˈstænd" }] },
          { sym: "ː", name: "Long — hold the sound longer", examples: [{ lang: "de", word: "Staat", ipa: "ʃtaːt" }, { lang: "de", word: "Stadt", ipa: "ʃtat" }] },
          { sym: "ʲ", name: "Slender (palatalised) — say it with a hint of “y”", examples: [{ lang: "ga", word: "tí", en: "house (genitive)" }] },
          { sym: "ˠ", name: "Broad (velarised) — say it with the back of the tongue raised, a hint of “oo”", examples: [{ lang: "ga", word: "tá", en: "is" }] },
          { sym: "̪", name: "Dental — tongue against the teeth", examples: [{ lang: "ga", word: "doras", en: "door" }] },
        ],
      },
      {
        type: "text",
        body: "ʲ and ˠ are the key to Irish. Almost every Irish consonant comes in two versions — broad (ˠ) and slender (ʲ) — and the spelling tells you which: a consonant next to a, o or u is broad; next to e or i it's slender.",
      },
    ],
    quiz: [
      { q: "Where does the stress mark ˈ go?", options: ["Before the stressed syllable", "After the stressed vowel", "At the end of the word", "Above the vowel"], answer: 0 },
      { q: "What does ː mean?", options: ["Hold the sound longer", "Stop the air", "Say it through your nose", "Don't pronounce it"], answer: 0 },
      { q: "In Irish, a consonant next to e or i is…", options: ["Slender (ʲ)", "Broad (ˠ)", "Silent", "Always doubled"], answer: 0 },
    ],
  },
  {
    id: "spanish",
    title: "Sounds of Spanish",
    lang: "es",
    blurb: "Five pure vowels, soft consonants and two r's.",
    blocks: [
      { type: "text", body: "Spanish has only five vowels, always pure and short: /a e i o u/. No “uh” sound — every vowel is said clearly, even when unstressed." },
      {
        type: "examples",
        title: "Soft b, d, g between vowels",
        rows: [
          { lang: "es", word: "bebé", ipa: "beˈβe", en: "baby" },
          { lang: "es", word: "cada", ipa: "ˈkaða", en: "each" },
          { lang: "es", word: "agua", ipa: "ˈaɣwa", en: "water" },
        ],
      },
      {
        type: "examples",
        title: "Tap and trill",
        rows: [
          { lang: "es", word: "pero", ipa: "ˈpeɾo", en: "but" },
          { lang: "es", word: "perro", ipa: "ˈpero", en: "dog" },
          { lang: "es", word: "rosa", ipa: "ˈrosa", en: "rose — r at the start is rolled" },
        ],
      },
      {
        type: "examples",
        title: "Letters to watch",
        rows: [
          { lang: "es", word: "jamón", ipa: "xaˈmon", en: "j = x" },
          { lang: "es", word: "gente", ipa: "ˈxente", en: "g before e/i = x" },
          { lang: "es", word: "niño", ipa: "ˈniɲo", en: "ñ = ɲ" },
          { lang: "es", word: "llave", ipa: "ˈʝaβe", en: "ll ≈ y" },
          { lang: "es", word: "hola", ipa: "ˈola", en: "h is silent" },
          { lang: "es", word: "cielo", ipa: "ˈθjelo", en: "c/z = θ in Spain, s in Latin America" },
        ],
      },
    ],
    quiz: [
      { q: "How many vowel sounds does Spanish have?", options: ["5", "8", "12", "20"], answer: 0 },
      { q: "Spanish h in hola is…", options: ["Silent", "Like English h", "Like x", "Like ʃ"], answer: 0 },
      { q: "The d in cada sounds like…", options: ["ð — soft th as in “this”", "A hard English d", "t", "Silent"], answer: 0 },
    ],
  },
  {
    id: "german",
    title: "Sounds of German",
    lang: "de",
    blurb: "Two ch sounds, rounded front vowels and a throaty r.",
    blocks: [
      {
        type: "examples",
        title: "ich-Laut and ach-Laut",
        rows: [
          { lang: "de", word: "ich", ipa: "ɪç", en: "after e, i, ä, ö, ü — soft ç" },
          { lang: "de", word: "Milch", ipa: "mɪlç", en: "milk" },
          { lang: "de", word: "Bach", ipa: "bax", en: "after a, o, u — throaty x" },
          { lang: "de", word: "Buch", ipa: "buːx", en: "book" },
        ],
      },
      {
        type: "examples",
        title: "Umlauts — front rounded vowels",
        rows: [
          { lang: "de", word: "müde", ipa: "ˈmyːdə", en: "tired" },
          { lang: "de", word: "Hütte", ipa: "ˈhʏtə", en: "hut" },
          { lang: "de", word: "schön", ipa: "ʃøːn", en: "beautiful" },
          { lang: "de", word: "können", ipa: "ˈkœnən", en: "can" },
        ],
      },
      {
        type: "examples",
        title: "Rules worth knowing",
        rows: [
          { lang: "de", word: "Tag", ipa: "taːk", en: "final b/d/g sound like p/t/k" },
          { lang: "de", word: "Stadt", ipa: "ʃtat", en: "st/sp at the start = ʃt/ʃp" },
          { lang: "de", word: "Wasser", ipa: "ˈvasɐ", en: "w = v; -er = ɐ" },
          { lang: "de", word: "Zeit", ipa: "tsaɪ̯t", en: "z = ts" },
          { lang: "de", word: "rot", ipa: "ʁoːt", en: "throaty r" },
        ],
      },
    ],
    quiz: [
      { q: "ch in ich is…", options: ["ç — soft hiss", "x — throaty", "k", "ʃ"], answer: 0 },
      { q: "The g at the end of Tag sounds like…", options: ["k", "g", "x", "Silent"], answer: 0 },
      { q: "st at the start of Stadt sounds like…", options: ["ʃt — “sht”", "st", "ts", "zt"], answer: 0 },
    ],
  },
  {
    id: "irish",
    title: "Sounds of Irish",
    lang: "ga",
    blurb: "Broad and slender, lenition and eclipsis — the heart of Irish.",
    blocks: [
      {
        type: "text",
        body: "Irish spelling looks wild to English eyes, but it is far more regular than English. Two ideas unlock almost all of it: every consonant is broad or slender, and the first sound of a word can change for grammar.",
      },
      {
        type: "text",
        body: "Broad and slender. A consonant beside a, o or u is broad (said with the tongue pulled back, a hint of “oo” — ˠ). Beside e or i it's slender (a hint of “y” — ʲ). The spelling rule “caol le caol, leathan le leathan” — slender with slender, broad with broad — keeps the vowels on both sides of a consonant agreeing, so you can always tell which it is.",
      },
      {
        type: "examples",
        title: "Hear the difference",
        rows: [
          { lang: "ga", word: "bó", en: "cow — broad b" },
          { lang: "ga", word: "beo", en: "alive — slender b" },
          { lang: "ga", word: "sí", en: "she — slender s = sh" },
          { lang: "ga", word: "suí", en: "sitting — broad s = s" },
          { lang: "ga", word: "Gaeilge", en: "Irish — slender lg" },
        ],
      },
      {
        type: "text",
        body: "Lenition (séimhiú) softens the first sound and is written by adding h: b→bh, c→ch, d→dh, f→fh (silent), g→gh, m→mh, p→ph, s→sh, t→th. It happens after mo (my), do (your), a (his), and in the past tense.",
      },
      {
        type: "examples",
        title: "Lenition — the sound softens",
        rows: [
          { lang: "ga", word: "cat", en: "cat" },
          { lang: "ga", word: "chat", en: "(his) cat — ch = x" },
          { lang: "ga", word: "bád", en: "boat" },
          { lang: "ga", word: "bhád", en: "(his) boat — bh = w/v" },
          { lang: "ga", word: "focal", en: "word" },
          { lang: "ga", word: "fhocal", en: "(his) word — fh is silent" },
        ],
      },
      {
        type: "text",
        body: "Eclipsis (urú) covers the first sound with a new one, written in front: b→mb, c→gc, d→nd, f→bhf, g→ng, p→bp, t→dt, and vowels take n-. You say only the new sound. It happens after ár (our), bhur (your, plural), a (their), i (in), and in questions with an.",
      },
      {
        type: "examples",
        title: "Eclipsis — the sound is replaced",
        rows: [
          { lang: "ga", word: "gcat", en: "(their) cat — say “gat”" },
          { lang: "ga", word: "mbád", en: "(their) boat — say “mawd”" },
          { lang: "ga", word: "bhfocal", en: "(their) word — say “vuh-kul”" },
          { lang: "ga", word: "nGaillimh", en: "in Galway — say “nga-liv”" },
        ],
      },
      { type: "respell" },
      { type: "dialect" },
    ],
    quiz: [
      { q: "A consonant beside a, o or u in Irish is…", options: ["Broad", "Slender", "Silent", "Doubled"], answer: 0 },
      { q: "How is fh said (as in fhocal)?", options: ["It's silent", "Like f", "Like v", "Like h"], answer: 0 },
      { q: "In gcat (their cat), which sound do you say?", options: ["g", "c", "both g and c", "neither"], answer: 0 },
      { q: "Lenition is written by…", options: ["Adding h after the first letter", "Adding a letter before the word", "Doubling the first letter", "Adding a fada"], answer: 0 },
    ],
  },
  {
    id: "challenge",
    title: "IPA challenge",
    blurb: "Mixed questions across everything.",
    blocks: [{ type: "text", body: "Ten quick questions. Get 8 or more to earn the Phonetics badge." }],
    quiz: [
      { q: "Which symbol is “sh”?", options: ["ʃ", "s", "ç", "x"], answer: 0 },
      { q: "Which word starts with a voiced sound?", options: ["zoo", "sue", "two", "pool"], answer: 0 },
      { q: "ç is found in German…", options: ["ich", "Bach", "Buch", "auch"], answer: 0 },
      { q: "Which mark shows a long sound?", options: ["ː", "ˈ", "ʲ", "ˠ"], answer: 0 },
      { q: "Irish bh in bhád sounds like…", options: ["w/v", "b", "silent", "bh as written"], answer: 0 },
      { q: "Spanish perro has which r?", options: ["r — rolled", "ɾ — tap", "ʁ — throaty", "none"], answer: 0 },
      { q: "German ü is which symbol?", options: ["y", "u", "i", "ʊ"], answer: 0 },
      { q: "Which Irish change replaces the first sound?", options: ["Eclipsis (urú)", "Lenition (séimhiú)", "The fada", "Stress"], answer: 0 },
      { q: "The schwa ə is…", options: ["A relaxed “uh”", "A long “ee”", "A rolled r", "A glottal stop"], answer: 0 },
      { q: "Slender consonants in Irish are marked in IPA with…", options: ["ʲ", "ˠ", "ː", "ˈ"], answer: 0 },
    ],
  },
];

/** Vowel chart positions: x 0 (front) → 1 (back), y 0 (close) → 1 (open). */
export const VOWELS: { sym: string; x: number; y: number; rounded: boolean; lang: Lang; word: string; ipa: string }[] = [
  { sym: "i", x: 0.05, y: 0.03, rounded: false, lang: "es", word: "sí", ipa: "si" },
  { sym: "y", x: 0.16, y: 0.03, rounded: true, lang: "de", word: "müde", ipa: "ˈmyːdə" },
  { sym: "u", x: 0.95, y: 0.03, rounded: true, lang: "es", word: "tú", ipa: "tu" },
  { sym: "ɪ", x: 0.22, y: 0.16, rounded: false, lang: "de", word: "ich", ipa: "ɪç" },
  { sym: "ʏ", x: 0.32, y: 0.16, rounded: true, lang: "de", word: "Hütte", ipa: "ˈhʏtə" },
  { sym: "ʊ", x: 0.8, y: 0.16, rounded: true, lang: "de", word: "Mutter", ipa: "ˈmʊtɐ" },
  { sym: "e", x: 0.14, y: 0.33, rounded: false, lang: "es", word: "mesa", ipa: "ˈmesa" },
  { sym: "ø", x: 0.25, y: 0.33, rounded: true, lang: "de", word: "schön", ipa: "ʃøːn" },
  { sym: "o", x: 0.93, y: 0.33, rounded: true, lang: "es", word: "como", ipa: "ˈkomo" },
  { sym: "ə", x: 0.55, y: 0.5, rounded: false, lang: "de", word: "bitte", ipa: "ˈbɪtə" },
  { sym: "ɛ", x: 0.25, y: 0.66, rounded: false, lang: "de", word: "Bett", ipa: "bɛt" },
  { sym: "œ", x: 0.36, y: 0.66, rounded: true, lang: "de", word: "können", ipa: "ˈkœnən" },
  { sym: "ɔ", x: 0.9, y: 0.66, rounded: true, lang: "de", word: "Sonne", ipa: "ˈzɔnə" },
  { sym: "ɐ", x: 0.55, y: 0.8, rounded: false, lang: "de", word: "Wasser", ipa: "ˈvasɐ" },
  { sym: "a", x: 0.4, y: 0.97, rounded: false, lang: "es", word: "casa", ipa: "ˈkasa" },
  { sym: "ɑ", x: 0.93, y: 0.97, rounded: false, lang: "ga", word: "tá", ipa: "t̪ˠɑː" },
];

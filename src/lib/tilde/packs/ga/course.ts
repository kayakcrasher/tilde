// Beginner course for the Lessons tab: real words and phrases, taught first,
// then practised. Plain English throughout — no grammar jargon. Standard
// (Caighdeán) Irish; the word-for-word lines show how Irish builds a sentence.
import type { CourseUnit } from "../../types";

export const COURSE: CourseUnit[] = [
  {
    id: "u1",
    title: "First words",
    about: "Say hello, goodbye, please and thank you.",
    lessons: [
      {
        id: "u1-l1",
        title: "Dia duit!",
        tip: "Irish greetings are blessings. Dia duit literally means “God to you”, and the reply adds Mary: Dia is Muire duit.",
        phrases: [
          { t: "Dia duit", en: "Hello", pic: "👋", lit: "God to you" },
          { t: "Dia is Muire duit", en: "Hello to you too", lit: "God and Mary to you", note: "The reply to Dia duit." },
          { t: "Slán", en: "Goodbye", lit: "Safe" },
          { t: "Maidin mhaith", en: "Good morning", pic: "🌅", lit: "Morning good" },
          { t: "Oíche mhaith", en: "Good night", pic: "🌙", lit: "Night good" },
        ],
      },
      {
        id: "u1-l2",
        title: "Please and thanks",
        tip: "Irish has no single word for yes or no. You answer with the verb instead: Tá (it is) or Níl (it isn't).",
        phrases: [
          { t: "Go raibh maith agat", en: "Thank you", pic: "🙏", lit: "May there be good at you" },
          { t: "Le do thoil", en: "Please", lit: "With your will" },
          { t: "Tá fáilte romhat", en: "You're welcome", lit: "There is welcome before you" },
          { t: "Gabh mo leithscéal", en: "Excuse me", note: "Also used for “sorry”." },
          { t: "Tá", en: "Yes", pic: "✅", lit: "It is" },
          { t: "Níl", en: "No", pic: "❌", lit: "It is not" },
        ],
      },
      {
        id: "u1-l3",
        title: "How are you?",
        tip: "Irish puts the verb first. Tá mé go maith is “Am I well” — that's just how Irish says “I am well”.",
        phrases: [
          { t: "Conas atá tú?", en: "How are you?", note: "In Connacht you'll also hear Cén chaoi a bhfuil tú?" },
          { t: "Tá mé go maith", en: "I am well", pic: "🙂", lit: "Am I well" },
          { t: "Go maith", en: "Good", pic: "👍" },
          { t: "Níl mé go maith", en: "I am not well", pic: "🙁", lit: "Am not I well" },
          { t: "Agus tú féin?", en: "And yourself?" },
        ],
      },
    ],
  },
  {
    id: "u2",
    title: "About me",
    about: "Say your name, where you're from, and who's in your family.",
    lessons: [
      {
        id: "u2-l1",
        title: "My name is…",
        tip: "To say who you are, Irish uses is: Is mise Seán means “It is me, Seán”.",
        phrases: [
          { t: "Is mise Seán", en: "I am Seán", lit: "It is me Seán" },
          { t: "Cad is ainm duit?", en: "What is your name?", lit: "What is name to you?" },
          { t: "Seán is ainm dom", en: "My name is Seán", lit: "Seán is name to me" },
          { t: "mé", en: "I", note: "Means both “I” and “me”." },
          { t: "tú", en: "you" },
        ],
      },
      {
        id: "u2-l2",
        title: "Where are you from?",
        tip: "Notice how Irish puts the important part first, then who it's about: Is as Meiriceá mé = “It is from America I (am)”.",
        phrases: [
          { t: "Cad as duit?", en: "Where are you from?", lit: "What from to you?" },
          { t: "Is as Meiriceá mé", en: "I am from America", lit: "It is from America I" },
          { t: "Is deas bualadh leat", en: "Nice to meet you", lit: "It is nice meeting with you" },
          { t: "Is mac léinn mé", en: "I am a student", pic: "🎓", lit: "It is a son of learning I" },
          { t: "Tá mé ag foghlaim Gaeilge", en: "I am learning Irish", lit: "Am I at learning Irish" },
        ],
      },
      {
        id: "u2-l3",
        title: "My family",
        tip: "Mo (my) softens the next word by adding an h: máthair → mo mháthair. Before a vowel it shrinks to m': athair → m'athair.",
        phrases: [
          { t: "máthair", en: "mother", pic: "👩" },
          { t: "athair", en: "father", pic: "👨" },
          { t: "mo mháthair", en: "my mother" },
          { t: "m'athair", en: "my father" },
          { t: "deartháir", en: "brother", pic: "👦" },
          { t: "deirfiúr", en: "sister", pic: "👧" },
        ],
      },
    ],
  },
  {
    id: "u3",
    title: "Food & drink",
    about: "Order at a café and say what you like.",
    lessons: [
      {
        id: "u3-l1",
        title: "On the table",
        tip: "Irish has a word for “the” (an) but no word for “a”: arán means “bread” or “a bread”.",
        phrases: [
          { t: "uisce", en: "water", pic: "💧", note: "Uisce beatha, “water of life”, gave English the word whiskey." },
          { t: "caife", en: "coffee", pic: "☕" },
          { t: "tae", en: "tea", pic: "🍵" },
          { t: "arán", en: "bread", pic: "🍞" },
          { t: "bainne", en: "milk", pic: "🥛" },
          { t: "úll", en: "apple", pic: "🍎" },
        ],
      },
      {
        id: "u3-l2",
        title: "At the café",
        tip: "Ba mhaith liom… means “I would like…” — word for word, “it would be good with me”.",
        phrases: [
          { t: "Ba mhaith liom uisce", en: "I would like water", lit: "Would be good with me water" },
          { t: "Cupán tae, le do thoil", en: "A cup of tea, please", pic: "🍵" },
          { t: "An bille, le do thoil", en: "The check, please", note: "An bille is the bill you pay at a restaurant." },
          { t: "Cé mhéad atá air?", en: "How much is it?", lit: "How much is on it?" },
          { t: "Seo duit", en: "Here you are", lit: "This to you" },
        ],
      },
      {
        id: "u3-l3",
        title: "I like it!",
        tip: "Feelings in Irish sit “on” you: Tá ocras orm = “hunger is on me”.",
        phrases: [
          { t: "Is maith liom caife", en: "I like coffee", lit: "Is good with me coffee" },
          { t: "Ní maith liom é", en: "I don't like it", lit: "Is not good with me it" },
          { t: "Tá ocras orm", en: "I am hungry", lit: "Hunger is on me" },
          { t: "Tá tart orm", en: "I am thirsty", lit: "Thirst is on me" },
          { t: "Tá sé go deas", en: "It is nice", pic: "😋", lit: "Is it nice" },
        ],
      },
    ],
  },
  {
    id: "u4",
    title: "Numbers & time",
    about: "Count to ten and talk about today and tomorrow.",
    lessons: [
      {
        id: "u4-l1",
        title: "One to five",
        tip: "When you count, put a in front of each number: a haon, a dó, a trí. Haon gets an h because it starts with a vowel.",
        phrases: [
          { t: "a haon", en: "one", pic: "1️⃣" },
          { t: "a dó", en: "two", pic: "2️⃣" },
          { t: "a trí", en: "three", pic: "3️⃣" },
          { t: "a ceathair", en: "four", pic: "4️⃣" },
          { t: "a cúig", en: "five", pic: "5️⃣" },
        ],
      },
      {
        id: "u4-l2",
        title: "Six to ten",
        phrases: [
          { t: "a sé", en: "six", pic: "6️⃣" },
          { t: "a seacht", en: "seven", pic: "7️⃣" },
          { t: "a hocht", en: "eight", pic: "8️⃣" },
          { t: "a naoi", en: "nine", pic: "9️⃣" },
          { t: "a deich", en: "ten", pic: "🔟" },
        ],
      },
      {
        id: "u4-l3",
        title: "Today and tomorrow",
        tip: "Inniu, amárach, inné — today, tomorrow, yesterday. Learn them as a set.",
        phrases: [
          { t: "inniu", en: "today" },
          { t: "amárach", en: "tomorrow" },
          { t: "inné", en: "yesterday" },
          { t: "Cén t-am é?", en: "What time is it?", lit: "What time is it?" },
          { t: "Tá sé a dó a chlog", en: "It is two o'clock", pic: "🕑", lit: "Is it two of the clock" },
        ],
      },
    ],
  },
  {
    id: "u5",
    title: "Out and about",
    about: "Find your way and ask for help.",
    lessons: [
      {
        id: "u5-l1",
        title: "Places",
        tip: "An means “the”. Before some words that start with a vowel it adds t-: an t-óstán.",
        phrases: [
          { t: "an teach", en: "the house", pic: "🏠" },
          { t: "an leithreas", en: "the bathroom", pic: "🚻", note: "Literally “the toilet”." },
          { t: "an trá", en: "the beach", pic: "🏖️" },
          { t: "an t-óstán", en: "the hotel", pic: "🏨" },
          { t: "an siopa", en: "the store", pic: "🏪" },
        ],
      },
      {
        id: "u5-l2",
        title: "Where is it?",
        tip: "Cá bhfuil…? means “Where is…?” The bh is said like a w, and the f is silent: “kaw will”.",
        phrases: [
          { t: "Cá bhfuil an leithreas?", en: "Where is the bathroom?" },
          { t: "anseo", en: "here" },
          { t: "ansin", en: "there" },
          { t: "ar dheis", en: "on the right", pic: "➡️" },
          { t: "ar chlé", en: "on the left", pic: "⬅️" },
        ],
      },
      {
        id: "u5-l3",
        title: "Help!",
        tip: "Don't worry about being perfect — Irish speakers are delighted when you try.",
        phrases: [
          { t: "Ní thuigim", en: "I don't understand" },
          { t: "An bhfuil Béarla agat?", en: "Do you speak English?", lit: "Is English at you?" },
          { t: "Níos moille, le do thoil", en: "Slower, please" },
          { t: "Tá beagán Gaeilge agam", en: "I speak a little Irish", lit: "A little Irish is at me" },
          { t: "Cabhair!", en: "Help!", pic: "🆘" },
        ],
      },
    ],
  },
  {
    id: "u6",
    title: "Everyday verbs",
    about: "Say what you do — the first step towards the Cloze game.",
    lessons: [
      {
        id: "u6-l1",
        title: "Tá — to be",
        tip: "Tá mé = I am. Níl mé = I am not. Put An bhfuil in front to ask: An bhfuil tú…? = Are you…?",
        phrases: [
          { t: "Tá mé tuirseach", en: "I am tired", pic: "😴", lit: "Am I tired" },
          { t: "Tá sé fuar", en: "It is cold", pic: "🥶", lit: "Is it cold" },
          { t: "Níl mé tuirseach", en: "I am not tired", lit: "Am not I tired" },
          { t: "An bhfuil tú go maith?", en: "Are you well?" },
          { t: "Tá sí anseo", en: "She is here", lit: "Is she here" },
        ],
      },
      {
        id: "u6-l2",
        title: "Having things",
        tip: "Irish has no verb “to have”. Things are “at” you instead: Tá madra agam = “a dog is at me”.",
        phrases: [
          { t: "Tá madra agam", en: "I have a dog", pic: "🐕", lit: "Is a dog at me" },
          { t: "Tá carr agam", en: "I have a car", pic: "🚗", lit: "Is a car at me" },
          { t: "Tá teach agam", en: "I have a house", pic: "🏠", lit: "Is a house at me" },
          { t: "Níl airgead agam", en: "I have no money", lit: "Is not money at me" },
          { t: "An bhfuil peann agat?", en: "Do you have a pen?", pic: "🖊️", lit: "Is a pen at you?" },
        ],
      },
      {
        id: "u6-l3",
        title: "I eat, I drink",
        tip: "Add -im or -aim to a verb to say “I do it”: ithim = I eat, ólaim = I drink.",
        phrases: [
          { t: "Ithim arán", en: "I eat bread", pic: "🍞" },
          { t: "Ólaim tae", en: "I drink tea", pic: "🍵" },
          { t: "Labhraím Gaeilge", en: "I speak Irish" },
          { t: "Téim abhaile", en: "I go home" },
          { t: "Tá cónaí orm in Éirinn", en: "I live in Ireland", lit: "Living is on me in Ireland" },
        ],
      },
    ],
  },
];

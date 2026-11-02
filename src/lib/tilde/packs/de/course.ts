// Beginner course for the Lessons tab: real words and phrases, taught first,
// then practised. Plain English throughout — no grammar jargon.
import type { CourseUnit } from "../../types";

export const COURSE: CourseUnit[] = [
  {
    id: "u1",
    title: "First words",
    about: "Say hello, goodbye, please and thank you.",
    lessons: [
      {
        id: "u1-l1",
        title: "Hallo!",
        tip: "The dots on ü change the sound: say “ee” with your lips rounded, as in Tschüss.",
        phrases: [
          { t: "Hallo", en: "Hello", pic: "👋" },
          { t: "Tschüss", en: "Bye", note: "Casual. Auf Wiedersehen is the polite goodbye." },
          { t: "Guten Morgen", en: "Good morning", pic: "🌅" },
          { t: "Gute Nacht", en: "Good night", pic: "🌙" },
          { t: "Danke", en: "Thank you", pic: "🙏" },
        ],
      },
      {
        id: "u1-l2",
        title: "Please and thanks",
        tip: "Bitte is a handy word: it means “please”, and also “here you go”.",
        phrases: [
          { t: "Bitte", en: "Please" },
          { t: "Ja", en: "Yes", pic: "✅" },
          { t: "Nein", en: "No", pic: "❌" },
          { t: "Gern geschehen", en: "You're welcome", lit: "Gladly happened" },
          { t: "Entschuldigung", en: "Sorry", note: "Also used for “excuse me”." },
        ],
      },
      {
        id: "u1-l3",
        title: "How are you?",
        tip: "Many German questions start with a question word: wie = how, wo = where, was = what.",
        phrases: [
          { t: "Wie geht's?", en: "How are you?", lit: "How goes it?" },
          { t: "Gut", en: "Good", pic: "🙂" },
          { t: "Sehr gut", en: "Very good", pic: "😄" },
          { t: "Nicht so gut", en: "Not so good", pic: "🙁" },
          { t: "Und dir?", en: "And you?", lit: "And to you?" },
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
        tip: "German has two words for “you”: du for family and friends, Sie for strangers. We'll use du.",
        phrases: [
          { t: "Ich heiße Anna", en: "My name is Anna", lit: "I am called Anna" },
          { t: "Wie heißt du?", en: "What is your name?", lit: "How are you called?" },
          { t: "Freut mich", en: "Nice to meet you", lit: "Pleases me" },
          { t: "ich", en: "I" },
          { t: "du", en: "you", note: "The friendly “you”, for family and friends." },
        ],
      },
      {
        id: "u2-l2",
        title: "Where are you from?",
        tip: "The letter ß is just a double s: heißen sounds like “HY-sen”.",
        phrases: [
          { t: "Ich bin Anna", en: "I am Anna" },
          { t: "Woher kommst du?", en: "Where are you from?", lit: "Where from come you?" },
          { t: "Ich komme aus den USA", en: "I am from the USA", lit: "I come out of the USA" },
          { t: "Ich bin Student", en: "I am a student", pic: "🎓", note: "A woman says Ich bin Studentin." },
          { t: "Du bist sehr nett", en: "You are very nice" },
        ],
      },
      {
        id: "u2-l3",
        title: "My family",
        tip: "German has three words for “the”: der, die and das. Learn each noun together with its “the” — think of it as part of the word.",
        phrases: [
          { t: "die Mutter", en: "the mother", pic: "👩" },
          { t: "der Vater", en: "the father", pic: "👨" },
          { t: "der Bruder", en: "the brother", pic: "👦" },
          { t: "die Schwester", en: "the sister", pic: "👧" },
          { t: "meine Familie", en: "my family", pic: "👨‍👩‍👧‍👦" },
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
        tip: "Every German noun starts with a capital letter — that's how you can spot them.",
        phrases: [
          { t: "das Wasser", en: "the water", pic: "💧" },
          { t: "der Kaffee", en: "the coffee", pic: "☕" },
          { t: "das Brot", en: "the bread", pic: "🍞" },
          { t: "die Milch", en: "the milk", pic: "🥛" },
          { t: "der Apfel", en: "the apple", pic: "🍎" },
        ],
      },
      {
        id: "u3-l2",
        title: "At the café",
        tip: "Ich möchte (I would like) is the polite way to order.",
        phrases: [
          { t: "Ich möchte Wasser", en: "I would like water" },
          { t: "Einen Kaffee, bitte", en: "A coffee, please" },
          { t: "Die Rechnung, bitte", en: "The check, please", note: "Die Rechnung is the bill you pay at a restaurant." },
          { t: "Was kostet das?", en: "How much is that?", lit: "What costs that?" },
          { t: "Bitte schön", en: "Here you go", note: "What a waiter says when handing you something." },
        ],
      },
      {
        id: "u3-l3",
        title: "I like it!",
        tip: "When food is good, Germans say it “tastes good”: Das schmeckt gut!",
        phrases: [
          { t: "Ich mag Kaffee", en: "I like coffee" },
          { t: "Ich mag das nicht", en: "I don't like that", lit: "I like that not" },
          { t: "Ich habe Hunger", en: "I am hungry", lit: "I have hunger" },
          { t: "Ich habe Durst", en: "I am thirsty", lit: "I have thirst" },
          { t: "Das schmeckt gut", en: "That tastes good", pic: "😋" },
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
        tip: "Numbers are worth learning by heart — you'll hear them for prices, times and phone numbers.",
        phrases: [
          { t: "eins", en: "one", pic: "1️⃣" },
          { t: "zwei", en: "two", pic: "2️⃣" },
          { t: "drei", en: "three", pic: "3️⃣" },
          { t: "vier", en: "four", pic: "4️⃣" },
          { t: "fünf", en: "five", pic: "5️⃣" },
        ],
      },
      {
        id: "u4-l2",
        title: "Six to ten",
        tip: "In German, ei sounds like English “eye”, and ie sounds like “ee”: drei, vier.",
        phrases: [
          { t: "sechs", en: "six", pic: "6️⃣" },
          { t: "sieben", en: "seven", pic: "7️⃣" },
          { t: "acht", en: "eight", pic: "8️⃣" },
          { t: "neun", en: "nine", pic: "9️⃣" },
          { t: "zehn", en: "ten", pic: "🔟" },
        ],
      },
      {
        id: "u4-l3",
        title: "Today and tomorrow",
        tip: "Telling the time works much like English: Es ist zwei Uhr = It is two o'clock.",
        phrases: [
          { t: "heute", en: "today" },
          { t: "morgen", en: "tomorrow", note: "With a capital, der Morgen means “the morning”." },
          { t: "gestern", en: "yesterday" },
          { t: "Wie spät ist es?", en: "What time is it?", lit: "How late is it?" },
          { t: "Es ist zwei Uhr", en: "It is two o'clock", pic: "🕑" },
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
        phrases: [
          { t: "das Haus", en: "the house", pic: "🏠" },
          { t: "die Toilette", en: "the bathroom", pic: "🚻", note: "Germans just say “the toilet”." },
          { t: "der Strand", en: "the beach", pic: "🏖️" },
          { t: "das Hotel", en: "the hotel", pic: "🏨" },
          { t: "der Laden", en: "the store", pic: "🏪" },
        ],
      },
      {
        id: "u5-l2",
        title: "Where is it?",
        tip: "Wo ist…? means “Where is…?” Careful: wo means where, and wer means who.",
        phrases: [
          { t: "Wo ist die Toilette?", en: "Where is the bathroom?" },
          { t: "hier", en: "here" },
          { t: "dort", en: "there" },
          { t: "rechts", en: "on the right", pic: "➡️" },
          { t: "links", en: "on the left", pic: "⬅️" },
        ],
      },
      {
        id: "u5-l3",
        title: "Help!",
        tip: "Don't worry about being perfect — people are happy when you try.",
        phrases: [
          { t: "Ich verstehe nicht", en: "I don't understand", lit: "I understand not" },
          { t: "Sprichst du Englisch?", en: "Do you speak English?", lit: "Speak you English?" },
          { t: "Langsamer, bitte", en: "Slower, please" },
          { t: "Ich spreche ein bisschen Deutsch", en: "I speak a little German" },
          { t: "Hilfe!", en: "Help!", pic: "🆘" },
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
        title: "I…",
        tip: "German verbs change their ending to show who is doing something. With ich (I), the verb usually ends in -e: ich wohne, ich trinke.",
        phrases: [
          { t: "Ich wohne in Berlin", en: "I live in Berlin" },
          { t: "Ich esse Brot", en: "I eat bread", pic: "🍞" },
          { t: "Ich trinke Wasser", en: "I drink water", pic: "💧" },
          { t: "Ich arbeite viel", en: "I work a lot" },
          { t: "Ich lerne Deutsch", en: "I am learning German", note: "German uses the same words for “I learn” and “I am learning”." },
        ],
      },
      {
        id: "u6-l2",
        title: "You, she, we",
        tip: "Change the ending to change who: ich wohne (I), du wohnst (you), sie wohnt (she), wir wohnen (we).",
        phrases: [
          { t: "Wo wohnst du?", en: "Where do you live?" },
          { t: "Sie wohnt hier", en: "She lives here", note: "Small sie means she; Sie with a capital is the polite “you”." },
          { t: "Wir wohnen in Berlin", en: "We live in Berlin" },
          { t: "Er arbeitet viel", en: "He works a lot" },
          { t: "Trinkst du Kaffee?", en: "Do you drink coffee?", lit: "Drink you coffee?" },
        ],
      },
      {
        id: "u6-l3",
        title: "Have, go, be",
        tip: "Haben (to have) and sein (to be) are the two most useful verbs: ich habe = I have, ich bin = I am.",
        phrases: [
          { t: "Ich habe einen Hund", en: "I have a dog", pic: "🐕" },
          { t: "Ich gehe nach Hause", en: "I am going home" },
          { t: "Ich bin müde", en: "I am tired", pic: "😴" },
          { t: "Mir geht es gut", en: "I am well", lit: "To me it goes well" },
          { t: "Das ist gut", en: "That is good" },
        ],
      },
    ],
  },
];

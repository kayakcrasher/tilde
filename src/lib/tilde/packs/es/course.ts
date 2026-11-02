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
        title: "Hello!",
        tip: "Spanish is spelled the way it sounds. The letter h is always silent, so hola sounds like “OH-la”.",
        phrases: [
          { t: "Hola", en: "Hello", pic: "👋" },
          { t: "Adiós", en: "Goodbye" },
          { t: "Buenos días", en: "Good morning", pic: "🌅", lit: "Good days" },
          { t: "Buenas noches", en: "Good night", pic: "🌙", note: "Also used for “good evening”." },
          { t: "Gracias", en: "Thank you", pic: "🙏" },
        ],
      },
      {
        id: "u1-l2",
        title: "Please and thanks",
        tip: "Watch the little accent marks. sí (with the mark) means yes; si (without it) means if.",
        phrases: [
          { t: "Por favor", en: "Please" },
          { t: "Sí", en: "Yes", pic: "✅" },
          { t: "No", en: "No", pic: "❌" },
          { t: "De nada", en: "You're welcome", lit: "Of nothing" },
          { t: "Perdón", en: "Sorry", note: "Also used for “excuse me”." },
        ],
      },
      {
        id: "u1-l3",
        title: "How are you?",
        tip: "Spanish questions start with an upside-down question mark: ¿Qué tal? It tells you a question is coming.",
        phrases: [
          { t: "¿Qué tal?", en: "How are you?", note: "Friendly and casual, like “How's it going?”." },
          { t: "Bien", en: "Good", pic: "🙂" },
          { t: "Muy bien", en: "Very good", pic: "😄" },
          { t: "Mal", en: "Bad", pic: "🙁" },
          { t: "¿Y tú?", en: "And you?" },
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
        tip: "Spanish often leaves out the word for “I”. The verb already shows who: me llamo means “I call myself”.",
        phrases: [
          { t: "Me llamo Ana", en: "My name is Ana", lit: "I call myself Ana" },
          { t: "¿Cómo te llamas?", en: "What is your name?", lit: "How do you call yourself?" },
          { t: "Mucho gusto", en: "Nice to meet you", lit: "Much pleasure" },
          { t: "yo", en: "I" },
          { t: "tú", en: "you", note: "The friendly “you”, for family and friends." },
        ],
      },
      {
        id: "u2-l2",
        title: "Where are you from?",
        tip: "Soy means “I am” when you say who or what you are: your name, your job, where you're from.",
        phrases: [
          { t: "Soy Ana", en: "I am Ana" },
          { t: "¿De dónde eres?", en: "Where are you from?", lit: "From where are you?" },
          { t: "Soy de Estados Unidos", en: "I am from the United States" },
          { t: "Soy estudiante", en: "I am a student", pic: "🎓" },
          { t: "Eres muy amable", en: "You are very kind" },
        ],
      },
      {
        id: "u2-l3",
        title: "My family",
        tip: "Every Spanish noun is either masculine or feminine. “The” is el for masculine words and la for feminine ones. Words ending in -o are usually el; words ending in -a are usually la.",
        phrases: [
          { t: "la madre", en: "the mother", pic: "👩" },
          { t: "el padre", en: "the father", pic: "👨" },
          { t: "el hermano", en: "the brother", pic: "👦" },
          { t: "la hermana", en: "the sister", pic: "👧" },
          { t: "mi familia", en: "my family", pic: "👨‍👩‍👧‍👦" },
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
        tip: "“A” is un for masculine words and una for feminine ones: un café, una manzana.",
        phrases: [
          { t: "el agua", en: "the water", pic: "💧", note: "Agua is feminine, but it takes el because it starts with a stressed a." },
          { t: "el café", en: "the coffee", pic: "☕" },
          { t: "el pan", en: "the bread", pic: "🍞" },
          { t: "la leche", en: "the milk", pic: "🥛" },
          { t: "la manzana", en: "the apple", pic: "🍎" },
        ],
      },
      {
        id: "u3-l2",
        title: "At the café",
        tip: "Add por favor to make anything polite.",
        phrases: [
          { t: "Quiero agua", en: "I want water" },
          { t: "Un café, por favor", en: "A coffee, please" },
          { t: "La cuenta, por favor", en: "The check, please", note: "La cuenta is the bill you pay at a restaurant." },
          { t: "¿Cuánto cuesta?", en: "How much is it?" },
          { t: "Aquí tiene", en: "Here you are", note: "What a waiter says when handing you something." },
        ],
      },
      {
        id: "u3-l3",
        title: "I like it!",
        tip: "To say you like something, Spanish says it “pleases” you: me gusta means “it pleases me”.",
        phrases: [
          { t: "Me gusta el café", en: "I like coffee", lit: "Coffee pleases me" },
          { t: "No me gusta", en: "I don't like it" },
          { t: "Tengo hambre", en: "I am hungry", lit: "I have hunger" },
          { t: "Tengo sed", en: "I am thirsty", lit: "I have thirst" },
          { t: "¡Qué rico!", en: "Delicious!", lit: "How rich!" },
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
          { t: "uno", en: "one", pic: "1️⃣" },
          { t: "dos", en: "two", pic: "2️⃣" },
          { t: "tres", en: "three", pic: "3️⃣" },
          { t: "cuatro", en: "four", pic: "4️⃣" },
          { t: "cinco", en: "five", pic: "5️⃣" },
        ],
      },
      {
        id: "u4-l2",
        title: "Six to ten",
        phrases: [
          { t: "seis", en: "six", pic: "6️⃣" },
          { t: "siete", en: "seven", pic: "7️⃣" },
          { t: "ocho", en: "eight", pic: "8️⃣" },
          { t: "nueve", en: "nine", pic: "9️⃣" },
          { t: "diez", en: "ten", pic: "🔟" },
        ],
      },
      {
        id: "u4-l3",
        title: "Today and tomorrow",
        tip: "Mañana means both “tomorrow” and “morning”.",
        phrases: [
          { t: "hoy", en: "today" },
          { t: "mañana", en: "tomorrow" },
          { t: "ayer", en: "yesterday" },
          { t: "¿Qué hora es?", en: "What time is it?", lit: "What hour is it?" },
          { t: "Son las dos", en: "It is two o'clock", pic: "🕑", lit: "They are the two" },
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
          { t: "la casa", en: "the house", pic: "🏠" },
          { t: "el baño", en: "the bathroom", pic: "🚻" },
          { t: "la playa", en: "the beach", pic: "🏖️" },
          { t: "el hotel", en: "the hotel", pic: "🏨", note: "The h is silent: “oh-TEL”." },
          { t: "la tienda", en: "the store", pic: "🏪" },
        ],
      },
      {
        id: "u5-l2",
        title: "Where is it?",
        tip: "¿Dónde está…? means “Where is…?” — put any place on the end.",
        phrases: [
          { t: "¿Dónde está el baño?", en: "Where is the bathroom?" },
          { t: "aquí", en: "here" },
          { t: "allí", en: "there" },
          { t: "a la derecha", en: "on the right", pic: "➡️" },
          { t: "a la izquierda", en: "on the left", pic: "⬅️" },
        ],
      },
      {
        id: "u5-l3",
        title: "Help!",
        tip: "Don't worry about being perfect — people are happy when you try.",
        phrases: [
          { t: "No entiendo", en: "I don't understand" },
          { t: "¿Hablas inglés?", en: "Do you speak English?" },
          { t: "Más despacio, por favor", en: "Slower, please" },
          { t: "Hablo un poco de español", en: "I speak a little Spanish" },
          { t: "¡Ayuda!", en: "Help!", pic: "🆘" },
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
        tip: "Spanish verbs change their ending to show who is doing something. An -o on the end usually means “I”: hablo = I speak.",
        phrases: [
          { t: "Hablo inglés", en: "I speak English" },
          { t: "Como pan", en: "I eat bread", pic: "🍞" },
          { t: "Bebo agua", en: "I drink water", pic: "💧" },
          { t: "Vivo en una casa", en: "I live in a house", pic: "🏠" },
          { t: "Trabajo mucho", en: "I work a lot" },
        ],
      },
      {
        id: "u6-l2",
        title: "You, she, we",
        tip: "Change the ending to change who: hablo (I), hablas (you), habla (he or she), hablamos (we).",
        phrases: [
          { t: "¿Hablas español?", en: "Do you speak Spanish?" },
          { t: "Ella habla inglés", en: "She speaks English" },
          { t: "Hablamos un poco", en: "We speak a little" },
          { t: "¿Dónde vives?", en: "Where do you live?" },
          { t: "Él trabaja mucho", en: "He works a lot" },
        ],
      },
      {
        id: "u6-l3",
        title: "Have, go, be",
        tip: "Spanish has two verbs for “to be”. Soy is for who you are; estoy is for how or where you are right now.",
        phrases: [
          { t: "Tengo un perro", en: "I have a dog", pic: "🐕" },
          { t: "Voy a casa", en: "I am going home" },
          { t: "Estoy cansado", en: "I am tired", pic: "😴", note: "A woman says estoy cansada." },
          { t: "Estoy bien", en: "I am well" },
          { t: "Está aquí", en: "It is here" },
        ],
      },
    ],
  },
];

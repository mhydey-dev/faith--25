// PLACEHOLDER CONTENT — swap names, traits, quiz answers, and story text.
import memory1 from "@/assets/memory-1.jpg";
import memory2 from "@/assets/memory-2.jpg";
import memory3 from "@/assets/memory-3.jpg";
import memory4 from "@/assets/memory-4.jpg";

export const HER_NAME = "Faith Funmilayo";
export const HER_FIRST = "Faith";
export const AGE = 25;

export const sections = [
  { id: "hero", label: "Home" },
  { id: "personality", label: "Her" },
  { id: "portrait", label: "Story" },
  { id: "timeline", label: "Timeline" },
  { id: "stats", label: "25 Years" },
  { id: "quiz", label: "Quiz" },
  { id: "letter", label: "Private" },
  { id: "wishes", label: "Wishes" },
];

export const personalityTraits = [
  {
    title: "Warm light",
    line: "She walks into a room and the temperature of the conversation changes — softer, kinder, somehow braver.",
  },
  {
    title: "Quiet fire",
    line: "She does not shout her ambition. She builds it carefully, then surprises everyone when it blooms.",
  },
  {
    title: "Loyal compass",
    line: "If you are hers, you stay hers. Friendships with Faith are long roads, not short trips.",
  },
  {
    title: "Playful mind",
    line: "She can turn a dull Tuesday into a story worth retelling — usually with a joke you did not see coming.",
  },
  {
    title: "Deep feeler",
    line: "She notices the unsaid. She remembers the small things. She loves with her whole attention.",
  },
  {
    title: "Steady bloom",
    line: "Twenty-five years of becoming — and she is still growing into someone even more herself.",
  },
];

/** Featured story under the celebrant portrait — edit freely. */
export const portraitStory = {
  eyebrow: "Chapter twenty-five",
  headline: "This is her season.",
  paragraphs: [
    "Faith Funmilayo is turning twenty-five — a full quarter-century of laughter, growth, late-night talks, and the kind of courage that does not always look loud.",
    "Upload her portrait above, then leave this story (or rewrite it) so everyone who visits knows who she is: bright, intentional, and deeply loved.",
    "Here is to the girl she was, the woman she is, and every version still ahead.",
  ],
};

export const twentyFiveStats = [
  {
    value: "25",
    unit: "trips around the sun",
    metaphor: "Enough orbits to collect a constellation of people who adore her.",
  },
  {
    value: "9,131",
    unit: "days of becoming",
    metaphor: "Roughly nine thousand mornings she woke up and chose to keep going.",
  },
  {
    value: "∞",
    unit: "smiles given away",
    metaphor: "Statistically impossible to count. Metaphorically, they could light a city.",
  },
  {
    value: "100%",
    unit: "main character energy",
    metaphor: "Not louder than everyone — just unmistakably herself.",
  },
  {
    value: "1",
    unit: "Faith Funmilayo",
    metaphor: "There has only ever been one. The world is lucky she showed up.",
  },
  {
    value: "25×",
    unit: "reasons to celebrate",
    metaphor: "One for every year — and then some for the ones still unwritten.",
  },
];

export const quizQuestions = [
  {
    id: "q1",
    prompt: "What lights Faith up the most?",
    options: [
      { label: "Being around people she loves", correct: true },
      { label: "Sitting in silence forever", correct: false },
      { label: "Skipping every celebration", correct: false },
    ],
  },
  {
    id: "q2",
    prompt: "How would friends describe her in one word?",
    options: [
      { label: "Cold", correct: false },
      { label: "Radiant", correct: true },
      { label: "Forgettable", correct: false },
    ],
  },
  {
    id: "q3",
    prompt: "At a party, Faith is most likely to…",
    options: [
      { label: "Hide in a cupboard all night", correct: false },
      { label: "Make someone feel included", correct: true },
      { label: "Leave without saying goodbye… forever", correct: false },
    ],
  },
  {
    id: "q4",
    prompt: "Her love language feels closest to…",
    options: [
      { label: "Thoughtful presence & care", correct: true },
      { label: "Ignoring texts for sport", correct: false },
      { label: "Competitive complaining", correct: false },
    ],
  },
  {
    id: "q5",
    prompt: "Turning 25 means…",
    options: [
      { label: "The end of the story", correct: false },
      { label: "A brighter chapter starting now", correct: true },
      { label: "Nothing special at all", correct: false },
    ],
  },
];

export const timelinePlaceholders = [
  {
    date: "Year one vibes",
    title: "The beginning",
    caption: "Tiny Faith, already stealing hearts. Swap this photo for a real memory.",
    image: memory1,
  },
  {
    date: "Growing years",
    title: "Finding her laugh",
    caption: "The years she learned how loud joy can be.",
    image: memory2,
  },
  {
    date: "Becoming",
    title: "Soft strength",
    caption: "The chapter where she grew into her own name.",
    image: memory3,
  },
  {
    date: "Now — 25",
    title: "This glow",
    caption: "The woman standing in her light. Upload more frames below.",
    image: memory4,
  },
];

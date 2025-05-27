export const fakeSpeech = [
  { text: "There is light even in the darkest times.", emotion: "optimism" },
  { text: "The winds of change are gathering.", emotion: "anticipation" },
  {
    text: "We mourn the silence that follows every broken promise.",
    emotion: "sadness",
  },
  { text: "We prepare, knowing our time is near.", emotion: "anticipation" },
  { text: "Their greed knows no shame or limit.", emotion: "disgust" },
  { text: "We place our faith in the people beside us.", emotion: "trust" },
  { text: "Smiles spread across the crowd like wildfire.", emotion: "joy" },
  { text: "We feared the darkness might never lift.", emotion: "fear" },
  { text: "We will not tolerate the injustice any longer.", emotion: "anger" },
  { text: "Children laughed freely in the parks once more.", emotion: "joy" },
  { text: "You have stood by me through the storm.", emotion: "trust" },
  {
    text: "They shake hands with blood still on their palms.",
    emotion: "disgust",
  },
  { text: "Hope walks beside us.", emotion: "optimism" },
  { text: "Love is the thread that binds us.", emotion: "love" },
  { text: "There are shadows that still haunt our future.", emotion: "fear" },
  {
    text: "This betrayal cuts deep into the soul of our nation.",
    emotion: "anger",
  },
  { text: "Let compassion guide our steps.", emotion: "love" },
  { text: "Loss echoes in every empty chair.", emotion: "sadness" },
  { text: "We speak, knowing they may come for us next.", emotion: "fear" },
  { text: "Tomorrow is ours to shape.", emotion: "optimism" },
  { text: "They stole from the poor to feed their greed.", emotion: "anger" },
  {
    text: "We watched in horror as they laughed at our pain.",
    emotion: "disgust",
  },
  { text: "Let us move forward, hand in hand.", emotion: "trust" },
  { text: "A new dawn awaits us.", emotion: "anticipation" },
  { text: "Tears fell for the lives we could not save.", emotion: "sadness" },
  { text: "What happens when no one listens anymore?", emotion: "fear" },
  { text: "We held each other in the silence.", emotion: "love" },
  { text: "I see my country in your eyes.", emotion: "love" },
  {
    text: "They lied to our faces and called it leadership.",
    emotion: "anger",
  },
  {
    text: "We danced together under the stars, hearts full of joy.",
    emotion: "joy",
  },
  { text: "How can they stand tall on broken backs?", emotion: "disgust" },
  {
    text: "The sun rose on a new day filled with opportunity.",
    emotion: "joy",
  },
  { text: "We are here because we care.", emotion: "love" },
  { text: "We built this together, brick by brick.", emotion: "trust" },
  { text: "I place my faith in the people beside me.", emotion: "trust" },
  {
    text: "The weight of our history hangs heavy tonight.",
    emotion: "sadness",
  },
  { text: "They stole from the poor to feed their greed.", emotion: "anger" },
  { text: "We feared the darkness might never lift.", emotion: "fear" },
  { text: "We are sickened by what they've normalized.", emotion: "disgust" },
  {
    text: "This is not the end, but the start of something better.",
    emotion: "optimism",
  },
  { text: "Our patience has been tested beyond limits.", emotion: "anger" },
  { text: "We rise, again and again.", emotion: "optimism" },
  {
    text: "We mourn the silence that follows every broken promise.",
    emotion: "sadness",
  },
  { text: "The tears of our people will not be ignored.", emotion: "anger" },
  { text: "Tears fell for the lives we could not save.", emotion: "sadness" },
  { text: "We place our faith in the people beside us.", emotion: "trust" },
  { text: "Let compassion guide our steps.", emotion: "love" },
  { text: "Our journey is long, but our resolve is strong.", emotion: "trust" },
  { text: "There is strength in our unity.", emotion: "trust" },
  {
    text: "This betrayal cuts deep into the soul of our nation.",
    emotion: "anger",
  },
  { text: "The winds of change are gathering.", emotion: "anticipation" },
  {
    text: "Their silence was more terrifying than their threats.",
    emotion: "fear",
  },
  { text: "Love is the thread that binds us.", emotion: "love" },
  { text: "We built this together, brick by brick.", emotion: "trust" },
  { text: "Hope walks beside us.", emotion: "optimism" },
  {
    text: "Something greater is just around the corner.",
    emotion: "anticipation",
  },
  { text: "Let us move forward, hand in hand.", emotion: "trust" },
  { text: "What happens when no one listens anymore?", emotion: "fear" },
  { text: "Their greed knows no shame or limit.", emotion: "disgust" },
  { text: "You have stood by me through the storm.", emotion: "trust" },
  { text: "Smiles spread across the crowd like wildfire.", emotion: "joy" },
  {
    text: "We danced together under the stars, hearts full of joy.",
    emotion: "joy",
  },
  {
    text: "They shake hands with blood still on their palms.",
    emotion: "disgust",
  },
  {
    text: "This is not the end, but the start of something better.",
    emotion: "optimism",
  },
  { text: "I see my country in your eyes.", emotion: "love" },
  { text: "Our patience has been tested beyond limits.", emotion: "anger" },
  { text: "Children laughed freely in the parks once more.", emotion: "joy" },
  { text: "Tears fell for the lives we could not save.", emotion: "sadness" },
  { text: "There is light even in the darkest times.", emotion: "optimism" },
  {
    text: "Something greater is just around the corner.",
    emotion: "anticipation",
  },
  { text: "They stole from the poor to feed their greed.", emotion: "anger" },
  {
    text: "The weight of our history hangs heavy tonight.",
    emotion: "sadness",
  },
  {
    text: "This betrayal cuts deep into the soul of our nation.",
    emotion: "anger",
  },
  { text: "Let us move forward, hand in hand.", emotion: "trust" },
  { text: "Love is the thread that binds us.", emotion: "love" },
  { text: "Hope walks beside us.", emotion: "optimism" },
  { text: "We are here because we care.", emotion: "love" },
  { text: "Loss echoes in every empty chair.", emotion: "sadness" },
  { text: "How can they stand tall on broken backs?", emotion: "disgust" },
];

export type EmotionType =
  | "joy"
  | "anger"
  | "sadness"
  | "fear"
  | "disgust"
  | "trust"
  | "anticipation"
  | "love"
  | "optimism";

export const emotionColorPalette: Record<EmotionType, string[]> = {
  joy: ["rgb(255, 215, 0)", "rgb(0, 255, 200)"],
  anger: ["rgb(255, 60, 60)", "rgb(200, 0, 50)"],
  sadness: ["rgb(120, 120, 255)", "rgb(80, 60, 150)"],
  fear: ["rgb(100, 100, 100)", "rgb(60, 60, 80)"],
  disgust: ["rgb(150, 255, 80)", "rgb(100, 180, 60)"],
  trust: ["rgb(0, 180, 255)", "rgb(0, 140, 255)"],
  anticipation: ["rgb(255, 140, 0)", "rgb(255, 180, 80)"],
  love: ["rgb(255, 105, 180)", "rgb(255, 160, 200)"],
  optimism: ["rgb(180, 255, 100)", "rgb(200, 255, 180)"],
};

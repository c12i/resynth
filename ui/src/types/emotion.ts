export type EmotionType =
  | "anger"
  | "disgust"
  | "fear"
  | "joy"
  | "neutral"
  | "sadness"
  | "surprise";

export interface EmotionScore {
  label: EmotionType;
  score: number;
}

export interface EmotionVisualStyle {
  lineWidth: number;
  opacity: number;
  blur: number;
}

export interface SpeechSegment {
  text: string;
  emotionScores: EmotionScore[];
}

export interface SpeechWithMetadata {
  speaker: string;
  event: string;
  date: string;
  lines: SpeechSegment[];
}

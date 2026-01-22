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

export type SentimentType =
  | "very_negative"
  | "negative"
  | "neutral"
  | "positive"
  | "very_positive";

export interface SpeechWithMetadata {
  speaker: string;
  event: string;
  date: string;
  lines: SpeechSegment[];
  sentiment?: SentimentType;
  sentimentScore?: number;
}

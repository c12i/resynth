import type { EmotionType } from "../types/emotion";

export type ToneStyle = "ambient" | "synthwave" | "lofi";

export const toneStyles: Record<
  ToneStyle,
  {
    oscillators: Record<EmotionType, string>;
    synthConfig: {
      count?: number;
      spread?: number;
      attack: number;
      decay: number;
      sustain: number;
      release: number;
      portamento: number;
    };
    filterFreqs: Record<string, number>;
  }
> = {
  ambient: {
    oscillators: {
      joy: "triangle", // Bright and smooth - pure harmonic content for uplifting feel
      anger: "sawtooth", // Will be filtered for warmth - rich harmonics softened by lowpass
      sadness: "sine", // Pure and melancholic - fundamental frequency only, minimal overtones
      fear: "sine2", // Subtle texture - two sine waves for gentle complexity
      disgust: "square", // Will be heavily filtered - harsh harmonics tamed for unsettling tone
      surprise: "triangle", // Quick and bright - clean attack with balanced harmonics
      neutral: "sine", // Pure tone - centered, balanced, no coloration
    },
    synthConfig: {
      attack: 0.3,
      decay: 0.4,
      sustain: 0.6, // Original value for longer sustain
      release: 2.5, // Original value for smoother fade
      portamento: 0,
    },
    filterFreqs: {
      anger: 1200,
      disgust: 800,
      fear: 1500,
      joy: 3000,
      neutral: 2000,
      sadness: 1000,
      surprise: 2500,
    },
  },
  synthwave: {
    oscillators: {
      joy: "fatsawtooth", // Bright, wide synthwave lead
      anger: "fatsquare", // Aggressive, thick square wave
      sadness: "fatsawtooth", // Warm, lush pad sound
      fear: "pwm", // Pulse width modulation - classic synth
      disgust: "fatsquare", // Heavy, distorted
      surprise: "fatsawtooth", // Sharp, bright
      neutral: "triangle", // Smooth, balanced
    },
    synthConfig: {
      count: 3,
      spread: 40,
      attack: 0.05,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8,
      portamento: 0.05,
    },
    filterFreqs: {
      anger: 1800,
      disgust: 1000,
      fear: 2000,
      joy: 4000,
      neutral: 2500,
      sadness: 1200,
      surprise: 3500,
    },
  },
  lofi: {
    oscillators: {
      joy: "triangle", // Warm and mellow
      anger: "sawtooth", // Slightly gritty but warm
      sadness: "sine", // Soft and nostalgic
      fear: "triangle", // Gentle tension
      disgust: "square", // Muffled, lo-fi crunch
      surprise: "triangle", // Soft surprise
      neutral: "sine", // Clean and centered
    },
    synthConfig: {
      count: 2, // Slight unison for warmth
      spread: 15, // Gentle detune for lo-fi wobble
      attack: 0.08, // Soft attack, not too slow
      decay: 0.5,
      sustain: 0.5, // Moderate sustain
      release: 1.2, // Gentle fade
      portamento: 0.02, // Subtle pitch slides
    },
    filterFreqs: {
      anger: 800, // Muffled, warm
      disgust: 600, // Very muffled
      fear: 1000, // Subdued
      joy: 1800, // Brighter but not harsh
      neutral: 1200, // Balanced warmth
      sadness: 700, // Deep, warm sadness
      surprise: 1500, // Gentle brightness
    },
  },
};

import { useEffect } from "react";
import * as Tone from "tone";

import type { EmotionType } from "./data";

interface Props {
  emotion: EmotionType;
  trigger: boolean;
}

const EmotionSynth = ({ emotion, trigger }: Props) => {
  useEffect(() => {
    if (!trigger) return;

    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.4, decay: 0.2, sustain: 0.4, release: 1.5 },
    }).connect(new Tone.Reverb(4).toDestination());

    const emotionNotes: Record<EmotionType, string> = {
      joy: "E5",
      anger: "A2",
      sadness: "C3",
      fear: "D#3",
      disgust: "B2",
      trust: "C4",
      anticipation: "G4",
      love: "F#4",
      optimism: "D5",
    };

    const now = Tone.now();
    synth.triggerAttackRelease(emotionNotes[emotion], "4n", now);
  }, [trigger]);

  return null;
};

export default EmotionSynth;

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as Tone from "tone";
import { speeches } from "./data";
import { ParticleSystem } from "./components/ParticleSystem";
import type { EmotionType } from "./types/emotion";

// Smoother, filtered oscillators for less grainy audio
const emotionToOscillator = {
  joy: "triangle", // Bright and smooth
  anger: "sawtooth", // Will be filtered for warmth
  sadness: "sine", // Pure and melancholic
  fear: "sine2", // Subtle texture
  disgust: "square", // Will be heavily filtered
  surprise: "triangle", // Quick and bright
  neutral: "sine", // Pure tone
} as const;

// Refined note mappings for better emotional resonance
const emotionNotes: Record<string, string> = {
  anger: "G2", // Lower, more aggressive
  disgust: "Bb2", // Dissonant, unsettling
  fear: "Eb3", // Mid-range tension
  joy: "C5", // Higher, brighter
  neutral: "A3", // Centered, balanced
  sadness: "D3", // Low, somber
  surprise: "F#4", // Sharp, unexpected
};

export default function App() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedSpeech, setSelectedSpeech] = useState(0);
  const sampleSpeech = speeches[selectedSpeech];
  const current = sampleSpeech[index];
  const currentRef = useRef(current);

  useEffect(() => {
    currentRef.current = sampleSpeech[index];
  }, [index, sampleSpeech]);

  const emotionRef = useRef<EmotionType>(
    current.emotionScores[0].label as EmotionType,
  );

  // Audio setup
  useEffect(() => {
    if (!started) return;

    let interval: any;

    // Audio effects chain for smoother, less grainy sound
    const reverb = new Tone.Reverb({
      decay: 3.5,
      wet: 0.3,
    }).toDestination();

    const delay = new Tone.FeedbackDelay({
      delayTime: "8n",
      feedback: 0.2,
      wet: 0.15,
    }).connect(reverb);

    const filter = new Tone.Filter({
      frequency: 2000,
      type: "lowpass",
      rolloff: -24,
    }).connect(delay);

    const globalGain = new Tone.Gain(0.15).connect(filter);
    const backgroundSynth = new Tone.PolySynth().connect(globalGain);
    const melodySynth = new Tone.Synth().connect(globalGain);

    Tone.start().then(() => {
      backgroundSynth.set({
        oscillator: { type: "sine" },
        envelope: {
          attack: 2.0,
          release: 10.0,
        },
      });
      backgroundSynth.triggerAttack(["C3", "G3", "E4"]);

      const play = (emotion: string) => {
        const note = emotionNotes[emotion] || "A3";
        const oscType = emotionToOscillator[emotion as EmotionType] || "sine";

        melodySynth.set({
          oscillator: {
            type: oscType,
            partialCount: 4,
          },
          envelope: {
            attack: 0.3,
            decay: 0.4,
            sustain: 0.6,
            release: 2.5,
          },
        });

        const filterFreqs: Record<string, number> = {
          anger: 1200,
          disgust: 800,
          fear: 1500,
          joy: 3000,
          neutral: 2000,
          sadness: 1000,
          surprise: 2500,
        };
        filter.frequency.rampTo(filterFreqs[emotion] || 2000, 0.3);

        melodySynth.triggerAttackRelease(note, "2n", Tone.now());
      };

      play(current.emotionScores[0].label);

      interval = setInterval(() => {
        setIndex((i) => {
          const next = (i + 1) % speeches[selectedSpeech].length;
          emotionRef.current = speeches[selectedSpeech][next].emotionScores[0]
            .label as EmotionType;
          play(emotionRef.current);

          return next;
        });
      }, 1800);
    });

    return () => {
      clearInterval(interval);
      backgroundSynth.triggerRelease(["C3", "G3", "E4"]);
      melodySynth.triggerRelease(Tone.now());
      backgroundSynth.dispose();
      melodySynth.dispose();
      filter.dispose();
      delay.dispose();
      reverb.dispose();
      globalGain.dispose();
    };
  }, [started, selectedSpeech]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        fontFamily: "monospace",
      }}
    >
      {!started && (
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            padding: "1rem 2rem",
            color: "white",
            fontSize: "1.2rem",
            fontFamily: "monospace",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <p style={{ textAlign: "center" }}>resynth demo</p>
          <button onClick={() => setStarted(true)}>Begin Experience</button>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0, 80], fov: 45, near: 0.1, far: 1000 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <fog attach="fog" args={["#0a0a0a", 50, 120]} />
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.3} />
        <pointLight position={[-10, -10, -10]} intensity={0.2} />
        {started && (
          <>
            <ParticleSystem
              currentEmotion={emotionRef.current}
              emotionScores={current.emotionScores as any}
            />
            <EffectComposer>
              <Bloom
                intensity={0.15}
                luminanceThreshold={0.85}
                luminanceSmoothing={0.15}
                radius={0.4}
              />
            </EffectComposer>
          </>
        )}
      </Canvas>

      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "10px",
          color: "white",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p>
          {current.text} ({current.emotionScores[0].label})
        </p>
        <select
          style={{
            width: "250px",
            margin: "4px",
            padding: "4px",
          }}
          disabled={started}
          value={selectedSpeech}
          onChange={(e) => {
            setSelectedSpeech(Number(e.target.value));
          }}
        >
          <option value={0}>Speech A (mostly negative)</option>
          <option value={1}>Speech B (mostly positive)</option>
          <option value={2}>Speech C (mixed emotions)</option>
        </select>
      </div>
    </div>
  );
}

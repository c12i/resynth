import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls } from "@react-three/drei";
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
  const [autoRotate, setAutoRotate] = useState(true);
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
    let emotionCount = 0; // Track number of emotion changes
    let consecutiveEmotionCount = 0; // Track consecutive emotions for drum complexity
    let lastEmotion: EmotionType | null = null;

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

    // Drums - kick and tom for variety
    const drumGain = new Tone.Gain(0.22).toDestination();

    // Kick drum - deep bass
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: 0.5,
        sustain: 0.01,
        release: 0.5,
      },
    }).connect(drumGain);

    // Tom drum - mid-range, softer accent
    const tom = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 2,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.05,
        release: 0.4,
      },
    }).connect(drumGain);

    Tone.start().then(() => {
      backgroundSynth.set({
        oscillator: { type: "sine" },
        envelope: {
          attack: 2.0,
          release: 10.0,
        },
      });
      backgroundSynth.triggerAttack(["C3", "G3", "E4"]);

      // Drum patterns - will start after 8 emotion changes
      let beatCount = 0;
      const drumLoop = new Tone.Loop((time) => {
        const measure = beatCount % 4;

        // Base kick pattern - always present
        kick.triggerAttackRelease("C1", "8n", time, 0.9);
        kick.triggerAttackRelease("C1", "16n", time + 0.15, 0.7);

        // Exponential complexity based on consecutive emotion count

        // Level 1: 4+ consecutive - add extra kick
        if (consecutiveEmotionCount >= 4) {
          kick.triggerAttackRelease("C1", "16n", time + 0.5, 0.65);
        }

        // Level 2: 6+ consecutive - add tom accents
        if (consecutiveEmotionCount >= 6) {
          if (measure % 2 === 1) {
            tom.triggerAttackRelease("G2", "32n", time + 0.75, 0.45);
          }
        }

        // Level 3: 8+ consecutive - add tom fills
        if (consecutiveEmotionCount >= 8) {
          if (measure === 3) {
            // Descending tom fill every 4 beats
            tom.triggerAttackRelease("A2", "32n", time + 0.6, 0.5);
            tom.triggerAttackRelease("G2", "32n", time + 0.7, 0.55);
            tom.triggerAttackRelease("E2", "16n", time + 0.8, 0.6);
          }
        }

        // Level 4: 10+ consecutive - double-time kicks
        if (consecutiveEmotionCount >= 10) {
          kick.triggerAttackRelease("C1", "32n", time + 0.35, 0.5);
          kick.triggerAttackRelease("C1", "32n", time + 0.65, 0.55);
        }

        // Level 5: 12+ consecutive - rapid tom rolls
        if (consecutiveEmotionCount >= 12) {
          if (measure === 1 || measure === 3) {
            tom.triggerAttackRelease("A2", "32n", time + 0.4, 0.4);
            tom.triggerAttackRelease("G2", "32n", time + 0.5, 0.45);
          }
        }

        // Level 6: 15+ consecutive - full intensity
        if (consecutiveEmotionCount >= 15) {
          // Extra kicks on every beat
          kick.triggerAttackRelease("C1", "32n", time + 0.25, 0.6);
          kick.triggerAttackRelease("C1", "32n", time + 0.85, 0.65);

          // Continuous tom texture
          if (measure % 2 === 0) {
            tom.triggerAttackRelease("E2", "32n", time + 0.3, 0.5);
            tom.triggerAttackRelease("G2", "32n", time + 0.55, 0.5);
          }
        }

        beatCount++;
      }, "1n");

      Tone.Transport.bpm.value = 40; // Slower, more ambient
      Tone.Transport.start();

      const play = (emotion: string) => {
        const note = emotionNotes[emotion] || "A3";
        const oscType = emotionToOscillator[emotion as EmotionType] || "sine";

        // Release previous note before playing new one
        melodySynth.triggerRelease();

        melodySynth.set({
          oscillator: {
            type: oscType,
            partialCount: 4,
          },
          envelope: {
            attack: 0.3,
            decay: 0.4,
            sustain: 0.3, // Reduced from 0.6 for cleaner separation
            release: 1.0, // Reduced from 2.5 for faster fade-out
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

        // Play note with shorter duration for clearer separation
        melodySynth.triggerAttackRelease(note, "4n", Tone.now());
      };

      play(current.emotionScores[0].label);

      interval = setInterval(() => {
        setIndex((i) => {
          const next = (i + 1) % speeches[selectedSpeech].length;
          const newEmotion = speeches[selectedSpeech][next].emotionScores[0]
            .label as EmotionType;
          emotionRef.current = newEmotion;
          play(newEmotion);

          // Track consecutive emotions
          if (newEmotion === lastEmotion) {
            consecutiveEmotionCount++;
          } else {
            consecutiveEmotionCount = 1;
            lastEmotion = newEmotion;
          }

          // Start drums after 8 emotion changes
          emotionCount++;
          if (emotionCount === 8) {
            drumLoop.start(0);
          }

          return next;
        });
      }, 1800);
    });

    return () => {
      clearInterval(interval);
      Tone.Transport.stop();
      backgroundSynth.triggerRelease(["C3", "G3", "E4"]);
      melodySynth.triggerRelease(Tone.now());
      backgroundSynth.dispose();
      melodySynth.dispose();
      kick.dispose();
      tom.dispose();
      drumGain.dispose();
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

        {/* OrbitControls for mouse interaction */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          zoomSpeed={0.6}
          rotateSpeed={0.5}
          minDistance={40}
          maxDistance={100}
          onStart={() => setAutoRotate(false)}
          onEnd={() => {
            // Resume auto-rotate after 3 seconds of inactivity
            setTimeout(() => setAutoRotate(true), 3000);
          }}
        />

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

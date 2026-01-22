import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls } from "@react-three/drei";
import * as Tone from "tone";
import { speeches } from "./data";
import { ParticleSystem } from "./components/ParticleSystem";
import type { EmotionType } from "./types/emotion";

// Tone style configurations
type ToneStyle = "ambient" | "synthwave" | "lofi";

const toneStyles: Record<
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
      joy: "triangle",
      anger: "sawtooth",
      sadness: "sine",
      fear: "sine2",
      disgust: "square",
      surprise: "triangle",
      neutral: "sine",
    },
    synthConfig: {
      attack: 0.3,
      decay: 0.4,
      sustain: 0.6,
      release: 2.5,
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
      joy: "fatsawtooth",
      anger: "fatsquare",
      sadness: "fatsawtooth",
      fear: "pwm",
      disgust: "fatsquare",
      surprise: "fatsawtooth",
      neutral: "triangle",
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
  const [toneStyle, setToneStyle] = useState<ToneStyle>("synthwave");
  const sampleSpeech = speeches[selectedSpeech];
  const current = sampleSpeech[index];
  const currentRef = useRef(current);

  useEffect(() => {
    currentRef.current = sampleSpeech[index];
  }, [index, sampleSpeech]);

  const emotionRef = useRef<EmotionType>(
    current.emotionScores[0].label as EmotionType,
  );

  // Audio setup - reset when tone style changes
  useEffect(() => {
    if (!started) return;

    // Reset index when tone style changes
    setIndex(0);

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
        const style = toneStyles[toneStyle];
        const oscType = style.oscillators[emotion as EmotionType] || "triangle";

        // Release previous note before playing new one
        melodySynth.triggerRelease();

        const oscillatorConfig: any = {
          type: oscType,
        };

        // Add unison settings for synthwave
        if (style.synthConfig.count) {
          oscillatorConfig.count = style.synthConfig.count;
          oscillatorConfig.spread = style.synthConfig.spread;
        }

        // Add partialCount for ambient (original setting)
        if (toneStyle === "ambient") {
          oscillatorConfig.partialCount = 4;
        }

        melodySynth.set({
          oscillator: oscillatorConfig,
          envelope: {
            attack: style.synthConfig.attack,
            decay: style.synthConfig.decay,
            sustain: style.synthConfig.sustain,
            release: style.synthConfig.release,
          },
          portamento: style.synthConfig.portamento,
        });

        filter.frequency.rampTo(style.filterFreqs[emotion] || 2000, 0.3);

        // Note duration varies by style
        let noteDuration = "4n"; // Default for synthwave
        if (toneStyle === "ambient") {
          noteDuration = "2n"; // Longer, overlapping notes
        } else if (toneStyle === "lofi") {
          noteDuration = "4n."; // Dotted quarter note - slightly longer than synthwave
        }

        melodySynth.triggerAttackRelease(note, noteDuration, Tone.now());
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
  }, [started, selectedSpeech, toneStyle]); // Re-run when tone style changes

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
            padding: "2rem 3rem",
            color: "white",
            fontSize: "1.2rem",
            fontFamily: "monospace",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p
            style={{
              textAlign: "center",
              marginBottom: "1.5rem",
              fontSize: "1.5rem",
            }}
          >
            resynth demo
          </p>

          {/* Tone Style Selector */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "1rem",
              }}
            >
              Tone Style:
            </label>
            <select
              value={toneStyle}
              onChange={(e) => setToneStyle(e.target.value as ToneStyle)}
              style={{
                fontFamily: "monospace",
                fontSize: "1rem",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #555",
                background: "#1a1a1a",
                color: "white",
                cursor: "pointer",
                width: "100%",
              }}
            >
              <option value="ambient">Ambient</option>
              <option value="synthwave">Synthwave</option>
              <option value="lofi">Lo-Fi</option>
            </select>
          </div>

          <button
            onClick={() => setStarted(true)}
            style={{
              width: "100%",
              padding: "10px 20px",
              fontSize: "1.1rem",
              fontFamily: "monospace",
              background: "#333",
              color: "white",
              border: "1px solid #555",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Begin Experience
          </button>
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

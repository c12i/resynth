import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls } from "@react-three/drei";
import * as Tone from "tone";
import { loadSpeeches } from "./data";
import { ParticleSystem } from "./components/ParticleSystem";
import type { EmotionType, SpeechWithMetadata } from "./types/emotion";
import { toneStyles, type ToneStyle } from "./config/toneStyles";

// Emotion note mappings
const emotionNotes: Record<string, string> = {
  anger: "G2", // Lower, more aggressive
  disgust: "Bb2", // Dissonant, unsettling
  fear: "Eb3", // Mid-range tension
  joy: "C5", // Higher, brighter
  neutral: "A3", // Centered, balanced
  sadness: "D3", // Low, somber
  surprise: "F#4", // Sharp, unexpected
};

// Sentiment-based background chord mappings
// Each sentiment has a different chord voicing and mood
const sentimentChords: Record<string, string[]> = {
  very_negative: ["C2", "Eb2", "Gb2"], // Diminished - dark, tense, unsettling
  negative: ["C2", "Eb2", "G2"], // Minor - somber, melancholic
  neutral: ["C2", "F2", "A2"], // Suspended - ambiguous, floating
  positive: ["C2", "E2", "G2"], // Major - bright, hopeful
  very_positive: ["C2", "E2", "G2", "B2"], // Major 7th - uplifting, triumphant
};

export default function App() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedSpeech, setSelectedSpeech] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [toneStyle, setToneStyle] = useState<ToneStyle>("synthwave");
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [speechesLoaded, setSpeechesLoaded] = useState(false);
  const [loadedSpeeches, setLoadedSpeeches] = useState<SpeechWithMetadata[]>([]);
  const [consecutiveCount, setConsecutiveCount] = useState(0);

  const currentRef = useRef<any>(null);
  const masterGainRef = useRef<Tone.Gain | null>(null);
  const emotionRef = useRef<EmotionType>("neutral");

  // Load speeches on mount
  useEffect(() => {
    loadSpeeches().then((data) => {
      setLoadedSpeeches(data);
      setSpeechesLoaded(true);
    });
  }, []);

  // Update current ref when index or speech changes
  useEffect(() => {
    if (speechesLoaded && loadedSpeeches.length > 0) {
      const sampleSpeech = loadedSpeeches[selectedSpeech];
      if (sampleSpeech && sampleSpeech.lines[index]) {
        currentRef.current = sampleSpeech.lines[index];
        emotionRef.current = sampleSpeech.lines[index].emotionScores[0].label as EmotionType;
      }
    }
  }, [index, selectedSpeech, speechesLoaded, loadedSpeeches]);

  // Update master volume in real-time
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.rampTo(masterVolume, 0.1);
    }
  }, [masterVolume]);

  // Audio setup - reset when tone style changes
  useEffect(() => {
    if (!started || !speechesLoaded || loadedSpeeches.length === 0) return;

    // Reset index when tone style changes
    setIndex(0);

    let interval: any;
    let emotionCount = 0; // Track number of emotion changes
    let consecutiveEmotionCount = 0; // Track consecutive emotions for drum complexity
    let lastEmotion: EmotionType | null = null;

    // Master gain controls everything
    const masterGain = new Tone.Gain(masterVolume).toDestination();
    masterGainRef.current = masterGain;

    // Audio effects chain for smoother, less grainy sound
    const reverb = new Tone.Reverb({
      decay: 3.5,
      wet: 0.3,
    }).connect(masterGain);

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
    const drumGain = new Tone.Gain(0.22).connect(masterGain);

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
      // Get the sentiment-based chord for this speech
      const currentSpeech = loadedSpeeches[selectedSpeech];
      const sentiment = currentSpeech.sentiment || "neutral";
      const backgroundChord = sentimentChords[sentiment] || sentimentChords.neutral;

      backgroundSynth.set({
        oscillator: { type: "sine" },
        envelope: {
          attack: 2.0,
          release: 10.0,
        },
      });
      backgroundSynth.triggerAttack(backgroundChord);

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
          const next = (i + 1) % loadedSpeeches[selectedSpeech].lines.length;
          const newEmotion = loadedSpeeches[selectedSpeech].lines[next].emotionScores[0]
            .label as EmotionType;
          emotionRef.current = newEmotion;
          play(newEmotion);

          // Track consecutive emotions
          if (newEmotion === lastEmotion) {
            consecutiveEmotionCount++;
            setConsecutiveCount(consecutiveEmotionCount);
          } else {
            consecutiveEmotionCount = 1;
            setConsecutiveCount(1);
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
      // Release all notes (works for any chord)
      backgroundSynth.releaseAll();
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
      masterGain.dispose();
    };
  }, [started, selectedSpeech, toneStyle, loadedSpeeches]); // Re-run when tone style changes

  // Don't render until speeches are loaded
  if (!speechesLoaded || loadedSpeeches.length === 0) {
    return (
      <div style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "white",
        fontFamily: "monospace",
      }}>
        Loading speeches...
      </div>
    );
  }

  const sampleSpeech = loadedSpeeches[selectedSpeech];
  const current = sampleSpeech.lines[index];

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
              consecutiveEmotionCount={consecutiveCount}
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
        <p style={{ marginBottom: "4px", fontSize: "0.9rem" }}>
          <strong>{sampleSpeech.speaker}</strong> - {sampleSpeech.event} ({sampleSpeech.date})
        </p>
        {sampleSpeech.sentiment && (
          <p style={{ marginBottom: "8px", fontSize: "0.85rem", opacity: 0.8 }}>
            Overall sentiment: <strong>{sampleSpeech.sentiment.replace(/_/g, " ")}</strong>
            {sampleSpeech.sentimentScore && ` (${(sampleSpeech.sentimentScore * 100).toFixed(0)}%)`}
          </p>
        )}
        <p>
          {current.text} ({current.emotionScores[0].label})
        </p>
        <select
          style={{
            width: "350px",
            margin: "4px",
            padding: "6px",
            fontFamily: "monospace",
          }}
          disabled={started}
          value={selectedSpeech}
          onChange={(e) => {
            setSelectedSpeech(Number(e.target.value));
            setIndex(0); // Reset to first line when changing speech
          }}
        >
          {loadedSpeeches.map((speech, idx) => (
            <option key={idx} value={idx}>
              {speech.speaker} - {speech.event} ({speech.date})
            </option>
          ))}
        </select>
      </div>

      {/* Volume Control */}
      {started && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 10,
            color: "white",
            fontFamily: "monospace",
            fontSize: "0.9rem",
            background: "rgba(0, 0, 0, 0.7)",
            padding: "15px 20px",
            borderRadius: "8px",
            backdropFilter: "blur(10px)",
            minWidth: "200px",
          }}
        >
          <label style={{ display: "block", marginBottom: "5px" }}>
            Volume: {Math.round(masterVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume * 100}
            onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
            style={{
              width: "100%",
              cursor: "pointer",
            }}
          />
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { speeches } from "./data";

const emotionColors: Record<string, string> = {
  anger: "#ff0033",
  disgust: "#66cc00",
  fear: "#9933ff",
  joy: "#ffcc00",
  neutral: "#999999",
  sadness: "#3366cc",
  surprise: "#ff66cc",
};

// Reduced blur and adjusted opacity for cleaner visuals
const emotionVisuals: Record<
  string,
  { lineWidth: number; opacity: number; blur: number }
> = {
  anger: { lineWidth: 2.5, opacity: 0.7, blur: 8 },
  sadness: { lineWidth: 1.5, opacity: 0.5, blur: 6 },
  fear: { lineWidth: 1.0, opacity: 0.6, blur: 4 },
  joy: { lineWidth: 2.0, opacity: 0.8, blur: 10 },
  disgust: { lineWidth: 1.8, opacity: 0.6, blur: 7 },
  surprise: { lineWidth: 3.0, opacity: 0.9, blur: 12 },
  neutral: { lineWidth: 1.2, opacity: 0.4, blur: 5 },
};

// Smoother, filtered oscillators for less grainy audio
const emotionToOscillator = {
  joy: "triangle",      // Bright and smooth
  anger: "sawtooth",    // Will be filtered for warmth
  sadness: "sine",      // Pure and melancholic
  fear: "sine2",        // Subtle texture
  disgust: "square",    // Will be heavily filtered
  surprise: "triangle", // Quick and bright
  neutral: "sine",      // Pure tone
} as const;

// Refined note mappings for better emotional resonance
const emotionNotes: Record<string, string> = {
  anger: "G2",      // Lower, more aggressive
  disgust: "Bb2",   // Dissonant, unsettling
  fear: "Eb3",      // Mid-range tension
  joy: "C5",        // Higher, brighter
  neutral: "A3",    // Centered, balanced
  sadness: "D3",    // Low, somber
  surprise: "F#4",  // Sharp, unexpected
};

function hexToRgb(hex: string): [number, number, number] {
  const result = hex.match(/\w\w/g);
  return result
    ? (result.map((x) => parseInt(x, 16)) as [number, number, number])
    : [255, 255, 255];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function applyEmotionDistortion(
  emotion: string,
  x: number,
  y: number,
  z: number,
  frame: number,
): [number, number, number] {
  switch (emotion) {
    case "anger":
      // Explosive, aggressive bursts
      return [
        x + Math.sin(frame * 0.8 + x * 4) * 4,
        y + Math.cos(frame * 1.2 + y * 3) * 4,
        z + Math.sin(frame * 1.5 + z * 5) * 1,
      ];

    case "sadness":
      // Slow, downward pull, drooping motion
      return [
        x + Math.sin(frame / 100 + y * 0.2) * 0.5,
        y - Math.abs(Math.cos(frame / 70 + x * 0.3)) * 2.5,
        z + Math.sin(frame / 90 + z * 0.1) * 0.5,
      ];

    case "fear":
      // Erratic, jittery, unstable motion
      return [
        x + (Math.random() - 0.5) * 2.0,
        y + (Math.random() - 0.5) * 2.5,
        z + (Math.random() - 0.5) * 2.0,
      ];

    case "joy":
      // Upward spiraling, buoyant, rhythmic
      return [
        x + Math.cos(frame / 25 + y) * 2,
        y + Math.sin(frame / 30 + z * 0.5) * 2,
        z + Math.cos(frame / 20 + x * 0.5) * 2,
      ];

    case "disgust":
      // Warped, twisted, dissonant shifts
      return [
        x + Math.sin(y * 5 + frame / 15) * 3,
        y + Math.sin(z * 4 + frame / 20) * 3,
        z + Math.sin(x * 3 + frame / 10) * 3,
      ];

    case "surprise":
      // Sudden pulses, chaotic bursts
      const shock = Math.abs(Math.sin(frame / 5)) * 5;
      return [
        x + Math.sin(x * y + frame / 3) * shock,
        y + Math.cos(y * z + frame / 3) * shock,
        z + Math.sin(z * x + frame / 3) * shock,
      ];

    case "neutral":
    default:
      // Minimal, calm
      return [x, y, z];
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedSpeech, setSelectedSpeech] = useState(0);
  const sampleSpeech = speeches[selectedSpeech];
  const current = sampleSpeech[index];
  const currentRef = useRef(current);

  useEffect(() => {
    currentRef.current = sampleSpeech[index];
  }, [index]);

  const emotionRef = useRef(current.emotionScores[0].label);
  const currentColorRef = useRef(
    hexToRgb(emotionColors[current.emotionScores[0].label]),
  );

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    let { sin, cos, PI } = Math;
    let frame = 0;
    let particleGradient: string | CanvasGradient = "#ffffff";
    const cubeSize = 8; // Reduced from 12 (512 vs 1728 particles)
    let vertices: [number, number, number][] = [];
    let originalVertices: [number, number, number][] = [];
    let edges: [number, number][] = []; // Store particle connections
    let oldTimeStamp = performance.now();

    // Enable anti-aliasing for smoother rendering
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = "high";

    // Create particles in 3D grid
    for (let i = 0; i < cubeSize ** 3; i++) {
      let x = i % cubeSize;
      let y = ((i / cubeSize) >> 0) % cubeSize;
      let z = (i / cubeSize ** 2) >> 0;
      x -= cubeSize / 2 - 0.5;
      y -= cubeSize / 2 - 0.5;
      z -= cubeSize / 2 - 0.5;
      vertices.push([x, y, z]);
      originalVertices.push([x, y, z]);
    }

    // Create mesh connections (edges between nearby particles)
    for (let i = 0; i < vertices.length; i++) {
      const x = i % cubeSize;
      const y = ((i / cubeSize) >> 0) % cubeSize;
      const z = (i / cubeSize ** 2) >> 0;

      // Connect to adjacent particles (right, down, back)
      if (x < cubeSize - 1) edges.push([i, i + 1]); // Right
      if (y < cubeSize - 1) edges.push([i, i + cubeSize]); // Down
      if (z < cubeSize - 1) edges.push([i, i + cubeSize ** 2]); // Back
    }

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

    const globalGain = new Tone.Gain(0.1).connect(filter); // Reduced volume for headphone safety
    const backgroundSynth = new Tone.PolySynth().connect(globalGain);
    const melodySynth = new Tone.Synth().connect(globalGain);

    const loop = (timeStamp = performance.now()) => {
      const dt = (timeStamp - oldTimeStamp) / 1000;
      oldTimeStamp = timeStamp;
      frame += dt * 50;

      const emotionScores = currentRef.current.emotionScores;

      const visualStyle =
        emotionVisuals[emotionRef.current] || emotionVisuals["neutral"];

      const gradient = c.createLinearGradient(
        -canvas.width / 2,
        0,
        canvas.width / 2,
        0,
      );
      let offset = 0;
      const total = emotionScores.reduce(
        (sum: any, e: any) => sum + e.score,
        0,
      );
      emotionScores.forEach((e: any) => {
        const norm = e.score / total;
        gradient.addColorStop(offset, emotionColors[e.label] || "#ffffff");
        offset += norm;
      });
      particleGradient = gradient;

      const canvasW = canvas.offsetWidth;
      const canvasH = canvas.offsetHeight;
      if (canvas.width !== canvasW || canvas.height !== canvasH) {
        canvas.width = canvasW;
        canvas.height = canvasH;
      }

      const targetColor = hexToRgb(
        emotionColors[emotionRef.current] || "#ffffff",
      );
      const currentColor = currentColorRef.current;
      for (let i = 0; i < 3; i++) {
        currentColor[i] = Math.floor(
          lerp(currentColor[i], targetColor[i], 0.1),
        );
      }

      c.fillStyle = "#242424";
      c.globalAlpha = 0.5;
      c.fillRect(0, 0, canvas.width, canvas.height);
      c.globalAlpha = 1;

      c.save();
      c.translate(canvas.width / 2, canvas.height / 2);

      // Transform all vertices first
      const projectedVertices: [number, number, number][] = [];
      for (let i = 0; i < vertices.length; i++) {
        let [x0, y0, z0] = vertices[i];
        const [ox, oy, oz] = originalVertices[i];

        const [dx, dy, dz] = applyEmotionDistortion(
          emotionRef.current,
          ox,
          oy,
          oz,
          frame,
        );

        // Increased lerp factor for smoother transitions
        x0 = lerp(x0, dx, 0.12);
        y0 = lerp(y0, dy, 0.12);
        z0 = lerp(z0, dz, 0.12);
        vertices[i] = [x0, y0, z0];

        // Apply rotation transformations
        let x = x0 * cos((frame / 360) * PI) + sin((frame / 360) * PI) * z0;
        let z = -x0 * sin((frame / 360) * PI) + cos((frame / 360) * PI) * z0;
        let y = y0;

        let tx = x * cos((frame / 360) * PI) - y * sin((frame / 360) * PI);
        let ty = x * sin((frame / 360) * PI) + y * cos((frame / 360) * PI);
        x = tx;
        y = ty;

        // Apply perspective
        z -= 70;
        z += 1.2;
        y += 0.01;
        x += Math.cos(frame / 20 + y / 5);
        y += Math.sin(frame / 20 + z / 3);

        x /= z / canvas.height / 2;
        y /= z / canvas.height / 2;

        projectedVertices.push([x, y, z]);
      }

      // Draw mesh lines connecting particles
      c.globalAlpha = visualStyle.opacity;
      c.strokeStyle = particleGradient;
      c.lineWidth = visualStyle.lineWidth;
      c.shadowBlur = visualStyle.blur;
      c.shadowColor = particleGradient as any;

      for (const [i1, i2] of edges) {
        const [x1, y1] = projectedVertices[i1];
        const [x2, y2] = projectedVertices[i2];

        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
      }

      // Draw particles as small points for additional detail
      c.shadowBlur = visualStyle.blur * 0.5;
      for (let i = 0; i < projectedVertices.length; i++) {
        const [x, y] = projectedVertices[i];
        c.fillStyle = particleGradient;
        c.beginPath();
        c.arc(x, y, visualStyle.lineWidth * 0.6, 0, PI * 2);
        c.fill();
      }

      c.restore();
      requestAnimationFrame(loop);
    };

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
        //@ts-ignore
        const oscType = emotionToOscillator[emotion] || "sine";

        // Gentler envelope settings for smoother sound
        melodySynth.set({
          oscillator: {
            type: oscType,
            partialCount: 4, // Limit harmonics for cleaner sound
          },
          envelope: {
            attack: 0.3,    // Gentler attack
            decay: 0.4,
            sustain: 0.6,
            release: 2.5,   // Longer release for smoother fade
          },
        });

        // Adjust filter cutoff based on emotion
        const filterFreqs: Record<string, number> = {
          anger: 1200,   // Darker, more aggressive
          disgust: 800,  // Very filtered, muted
          fear: 1500,    // Mid-range tension
          joy: 3000,     // Bright and open
          neutral: 2000, // Balanced
          sadness: 1000, // Dark and somber
          surprise: 2500,// Bright but not harsh
        };
        filter.frequency.rampTo(filterFreqs[emotion] || 2000, 0.3);

        melodySynth.triggerAttackRelease(note, "2n", Tone.now());
      };

      play(current.emotionScores[0].label);

      const interval = setInterval(() => {
        setIndex((i) => {
          const next = (i + 1) % sampleSpeech.length;
          emotionRef.current = sampleSpeech[next].emotionScores[0].label;
          play(emotionRef.current);
          return next;
        });
      }, 1000);

      loop();
      return () => clearInterval(interval);
    });
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
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
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
            width: "200px",
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
        </select>
      </div>
    </div>
  );
}

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

const emotionVisuals: Record<
  string,
  { size: number; opacity: number; blur: number }
> = {
  anger: { size: 6, opacity: 0.7, blur: 20 },
  sadness: { size: 4, opacity: 0.4, blur: 15 },
  fear: { size: 3, opacity: 0.6, blur: 8 },
  joy: { size: 5, opacity: 0.8, blur: 25 },
  disgust: { size: 4, opacity: 0.5, blur: 18 },
  surprise: { size: 7, opacity: 0.9, blur: 30 },
  neutral: { size: 3, opacity: 0.3, blur: 10 },
};

const emotionToOscillator = {
  joy: "triangle4",
  anger: "sawtooth4",
  sadness: "sine2",
  fear: "fatsine2",
  disgust: "triangle8",
  surprise: "square2",
  neutral: "sine",
} as const;

const emotionNotes: Record<string, string> = {
  anger: "A2",
  disgust: "C3",
  fear: "E3",
  joy: "A4",
  neutral: "C4",
  sadness: "D3",
  surprise: "E4",
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
    const cubeSize = 12;
    let vertices: [number, number, number][] = [];
    let originalVertices: [number, number, number][] = [];
    let oldTimeStamp = performance.now();

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

    const globalGain = new Tone.Gain(0.5).toDestination();
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
      const total = emotionScores.reduce((sum, e) => sum + e.score, 0);
      emotionScores.forEach((e) => {
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

        x0 = lerp(x0, dx, 0.05);
        y0 = lerp(y0, dy, 0.05);
        z0 = lerp(z0, dz, 0.05);
        vertices[i] = [x0, y0, z0];

        let x = x0 * cos((frame / 360) * PI) + sin((frame / 360) * PI) * z0;
        let z = -x0 * sin((frame / 360) * PI) + cos((frame / 360) * PI) * z0;
        let y = y0;

        let tx = x * cos((frame / 360) * PI) - y * sin((frame / 360) * PI);
        let ty = x * sin((frame / 360) * PI) + y * cos((frame / 360) * PI);
        x = tx;
        y = ty;

        z -= 70;
        z += 1.2;
        y += 0.01;
        x += Math.cos(frame / 20 + y / 5);
        y += Math.sin(frame / 20 + z / 3);

        x /= z / canvas.height / 2;
        y /= z / canvas.height / 2;

        c.globalAlpha = visualStyle.opacity;
        c.fillStyle = particleGradient;
        c.shadowBlur = visualStyle.blur;
        c.shadowColor = c.fillStyle as any;

        const s = visualStyle.size;
        c.fillRect(x - s / 2, y - s / 2, s, s);
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
        const note = emotionNotes[emotion] || "C4";
        //@ts-ignore
        const oscType = emotionToOscillator[emotion] || "sine";
        melodySynth.set({
          oscillator: { type: oscType },
          envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.7,
            release: 1.5,
          },
        });
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
        background: "black",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {!started && (
        <button
          onClick={() => setStarted(true)}
          style={{
            position: "absolute",
            zIndex: 1,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            background: "#00ffcc",
            color: "black",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Start Speech Experience
        </button>
      )}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "absolute",
          top: "10%",
          width: "100%",
          textAlign: "center",
          color: "white",
          fontSize: "1.5rem",
          fontWeight: "bold",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>{current.text} </p>
        <span style={{ marginLeft: 10 }}>
          ({current.emotionScores[0].label})
        </span>
        <select
          style={{ width: "20%", margin: "8px", padding: "4px" }}
          value={selectedSpeech}
          onChange={(e) => {
            setSelectedSpeech(Number(e.target.value));
          }}
        >
          <option value={0}>Speech A</option>
          <option value={1}>Speech B</option>
        </select>
      </div>
    </div>
  );
}

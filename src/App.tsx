import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

const emotionColors: Record<string, string> = {
  anger: "#ff0033",
  disgust: "#66cc00",
  fear: "#9933ff",
  joy: "#ffcc00",
  neutral: "#999999",
  sadness: "#3366cc",
  surprise: "#ff66cc",
};

const emotionNotes: Record<string, string> = {
  anger: "A2",
  disgust: "C3",
  fear: "D#3",
  joy: "E5",
  neutral: "C4",
  sadness: "G2",
  surprise: "F#4",
};

const sampleSpeech = [
  {
    text: "Fellow citizens, today we stand not as tribes or regions, but as a united people.",
    emotionScores: [
      { label: "joy", score: 0.75 },
      { label: "neutral", score: 0.25 },
    ],
  },
  {
    text: "We are called to rise beyond the politics of division.",
    emotionScores: [
      { label: "joy", score: 0.6 },
      { label: "anger", score: 0.4 },
    ],
  },
  {
    text: "For too long, promises were made and broken.",
    emotionScores: [
      { label: "sadness", score: 0.7 },
      { label: "anger", score: 0.3 },
    ],
  },
  {
    text: "Today, we chart a new course.",
    emotionScores: [
      { label: "joy", score: 0.8 },
      { label: "surprise", score: 0.2 },
    ],
  },
  {
    text: "A course grounded in service, not self-interest.",
    emotionScores: [{ label: "neutral", score: 1.0 }],
  },
  {
    text: "We shall fight corruption with every tool at our disposal.",
    emotionScores: [
      { label: "anger", score: 0.6 },
      { label: "fear", score: 0.4 },
    ],
  },
  {
    text: "We shall restore dignity to every office of public trust.",
    emotionScores: [
      { label: "joy", score: 0.7 },
      { label: "neutral", score: 0.3 },
    ],
  },
  {
    text: "No child shall go to bed hungry in a nation of plenty.",
    emotionScores: [
      { label: "sadness", score: 0.6 },
      { label: "anger", score: 0.4 },
    ],
  },
  {
    text: "Our farmers will no longer be prisoners of middlemen.",
    emotionScores: [
      { label: "anger", score: 0.5 },
      { label: "disgust", score: 0.5 },
    ],
  },
  {
    text: "We will transform our economy from consumption to production.",
    emotionScores: [
      { label: "joy", score: 0.6 },
      { label: "neutral", score: 0.4 },
    ],
  },
  {
    text: "Let us unite in hope, not fear.",
    emotionScores: [
      { label: "joy", score: 0.7 },
      { label: "fear", score: 0.3 },
    ],
  },
  {
    text: "Let us reject despair, and embrace our shared destiny.",
    emotionScores: [
      { label: "joy", score: 0.6 },
      { label: "surprise", score: 0.4 },
    ],
  },
  {
    text: "May our generation be remembered not for what we inherited, but what we built.",
    emotionScores: [
      { label: "joy", score: 0.5 },
      { label: "sadness", score: 0.5 },
    ],
  },
  {
    text: "May justice and equity be the cornerstones of our republic.",
    emotionScores: [
      { label: "neutral", score: 0.6 },
      { label: "joy", score: 0.4 },
    ],
  },
  {
    text: "Thank you, and may God bless our nation.",
    emotionScores: [{ label: "joy", score: 1.0 }],
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const result = hex.match(/\w\w/g);
  return result
    ? (result.map((x) => parseInt(x, 16)) as [number, number, number])
    : [255, 255, 255];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
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
    const cubeSize = 20;
    let vertices: [number, number, number][] = [];
    let originalVertices: [number, number, number][] = [];
    let oldTimeStamp = performance.now();

    const mouse = { x: 0, y: 0 };
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left - canvas.width / 2;
      mouse.y = e.clientY - rect.top - canvas.height / 2;
    });

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

    const analyser = new Tone.Analyser("fft", 128);
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
    }).toDestination();
    synth.connect(analyser);

    const loop = (timeStamp = performance.now()) => {
      const dt = (timeStamp - oldTimeStamp) / 1000;
      oldTimeStamp = timeStamp;
      frame += dt * 50;

      const emotionScores = currentRef.current.emotionScores;
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
        let dist = cubeSize / 2 - Math.sqrt(x0 ** 2 + y0 ** 2 + z0 ** 2);

        // 🧲 3D repulsion OR return to origin
        const dx = x0 * 10 - mouse.x;
        const dy = y0 * 10 - mouse.y;
        const distMouse = Math.sqrt(dx * dx + dy * dy);

        if (distMouse < 100 && distMouse > 1) {
          const force = (100 - distMouse) / 100;
          x0 += (dx / distMouse) * force * 0.1;
          y0 += (dy / distMouse) * force * 0.1;
        } else {
          x0 = lerp(x0, ox, 0.05);
          y0 = lerp(y0, oy, 0.05);
          z0 = lerp(z0, oz, 0.05);
        }

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

        c.fillStyle = particleGradient;
        c.shadowBlur = 15;
        c.shadowColor = c.fillStyle as any;
        c.fillRect(x - dist / 2, y - dist / 2, dist, dist);
      }

      c.restore();
      requestAnimationFrame(loop);
    };

    Tone.start().then(() => {
      const play = (emotion: string) => {
        const note = emotionNotes[emotion] || "C4";
        const now = Tone.now();
        try {
          synth.triggerRelease();
          synth.triggerAttackRelease(note, "2n", now + 0.05);
        } catch (err) {
          console.warn("Tone.js trigger error:", err);
        }
      };
      play(current.emotionScores[0].label);
      const interval = setInterval(() => {
        setIndex((i) => {
          const next = (i + 1) % sampleSpeech.length;
          emotionRef.current = sampleSpeech[next].emotionScores[0].label;
          play(sampleSpeech[next].emotionScores[0].label);
          return next;
        });
      }, 1000);
      loop();
      return () => clearInterval(interval);
    });
  }, [started]);

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
        }}
      >
        {current.text}{" "}
        <span style={{ marginLeft: 10 }}>
          ({current.emotionScores[0].label})
        </span>
      </div>
    </div>
  );
}

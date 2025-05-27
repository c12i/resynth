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
  { text: "We rise again.", emotion: "joy" },
  { text: "They turned their backs on the poor.", emotion: "anger" },
  { text: "I feel numb to all of this.", emotion: "neutral" },
  { text: "What we saw today was inhumane.", emotion: "disgust" },
  { text: "We don’t know what tomorrow holds.", emotion: "fear" },
  { text: "Thank you for standing with me.", emotion: "joy" },
  { text: "We are tired of empty promises.", emotion: "anger" },
  { text: "This silence speaks louder than words.", emotion: "sadness" },
  { text: "Together, we will find a way.", emotion: "joy" },
  { text: "That was unexpected, and yet inspiring.", emotion: "surprise" },
  { text: "The corruption is in every corner.", emotion: "disgust" },
  { text: "We stand at the edge of uncertainty.", emotion: "fear" },
  { text: "Today, I feel grateful.", emotion: "joy" },
  { text: "How many more must we lose?", emotion: "sadness" },
  { text: "The world is watching.", emotion: "neutral" },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const current = sampleSpeech[index];
  const emotionRef = useRef(current.emotion);

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    let { sin, cos, PI } = Math;
    let frame = 0;
    const cubeSize = 10;
    let vertices: [number, number, number][] = [];
    let oldTimeStamp = performance.now();

    for (let i = 0; i < cubeSize ** 3; i++) {
      let x = i % cubeSize;
      let y = ((i / cubeSize) >> 0) % cubeSize;
      let z = (i / cubeSize ** 2) >> 0;
      x -= cubeSize / 2 - 0.5;
      y -= cubeSize / 2 - 0.5;
      z -= cubeSize / 2 - 0.5;
      vertices.push([x, y, z]);
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

      const canvasW = canvas.offsetWidth;
      const canvasH = canvas.offsetHeight;
      if (canvas.width !== canvasW || canvas.height !== canvasH) {
        canvas.width = canvasW;
        canvas.height = canvasH;
      }

      const emotionColor = emotionColors[emotionRef.current] || "#ffffff";

      c.fillStyle = "#242424";
      c.globalAlpha = 0.5;
      c.fillRect(0, 0, canvas.width, canvas.height);
      c.globalAlpha = 1;

      c.save();
      c.translate(canvas.width / 2, canvas.height / 2);

      for (let i = 0; i < vertices.length; i++) {
        let [x0, y0, z0] = vertices[i];
        let dist = cubeSize / 2 - Math.sqrt(x0 ** 2 + y0 ** 2 + z0 ** 2);

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

        c.fillStyle = emotionColor;
        c.fillRect(x - dist / 2, y - dist / 2, dist, dist);
      }

      c.restore();
      requestAnimationFrame(loop);
    };

    Tone.start().then(() => {
      const play = (emotion: string) => {
        const note = emotionNotes[emotion] || "C4";
        const now = Tone.now();
        synth.triggerAttackRelease(note, "2n", now + 0.1);
      };
      play(current.emotion);
      const interval = setInterval(() => {
        setIndex((i) => {
          const next = (i + 1) % sampleSpeech.length;
          emotionRef.current = sampleSpeech[next].emotion;
          play(sampleSpeech[next].emotion);
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
        <span style={{ marginLeft: 10 }}>({current.emotion})</span>
      </div>
    </div>
  );
}

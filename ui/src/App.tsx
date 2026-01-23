import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Play from "./pages/Play";
import About from "./pages/About";

function DesktopOnlyMessage() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "'Work Sans', sans-serif",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(2rem, 10vw, 3rem)",
          fontFamily: "'Syne Mono', monospace",
          fontWeight: "400",
          marginBottom: "1.5rem",
          letterSpacing: "0.1em",
          width: "100%",
        }}
      >
        RESYNTH
      </h1>
      <p
        style={{
          fontSize: "clamp(1rem, 4vw, 1.1rem)",
          maxWidth: "500px",
          width: "100%",
          lineHeight: "1.6",
          color: "#aaa",
        }}
      >
        This experience is best viewed on desktop or larger tablet devices.
        <br />
        <br />
        Please visit on a larger screen to explore the full 3D audiovisual
        emotion visualization.
      </p>
    </div>
  );
}

export default function App() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      // consider desktop as 1024px and above (typical tablet landscape and desktop)
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!isDesktop) {
    return <DesktopOnlyMessage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<Play />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}


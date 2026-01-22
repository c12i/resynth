import { useNavigate } from "react-router-dom";
import { CustomDropdown } from "../components/CustomDropdown";
import { Button } from "../components/Button";
import { useState, useEffect } from "react";
import { loadSpeeches } from "../data";
import type { SpeechWithMetadata } from "../types/emotion";

export default function Home() {
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [speeches, setSpeeches] = useState<SpeechWithMetadata[]>([]);

  useEffect(() => {
    // Load speeches
    loadSpeeches().then((data) => {
      setSpeeches(data);
    });
  }, []);

  // Format speeches for dropdown
  const dropdownOptions = speeches.map((speech, index) => ({
    value: index,
    label: speech.speaker,
    sublabel: `${speech.event}, ${speech.date}`,
  }));

  const handleSpeechSelect = (value: string | number) => {
    // Navigate to play page with selected speech index
    navigate(`/play?speech=${value}`);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
        fontFamily: "'Work Sans', sans-serif",
        position: "relative",
      }}
    >
      <button
        onClick={() => navigate("/about")}
        style={{
          position: "fixed",
          top: "2rem",
          right: "2rem",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          fontWeight: "600",
          color: "#000",
          background: "#fff",
          border: "none",
          borderRadius: "9999px",
          cursor: "pointer",
          zIndex: 100,
          transition: "all 0.3s",
          fontFamily: "'Work Sans', sans-serif",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#ddd";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fff";
        }}
      >
        Info
      </button>

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "'Syne Mono', monospace",
            fontWeight: 400,
            fontSize: "80px",
            lineHeight: "100%",
            color: "#fff",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          RESYNTH
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            color: "#aaa",
            marginBottom: "3rem",
            textAlign: "center",
            maxWidth: "600px",
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: "400",
          }}
        >
          From voice to vibration, from conviction to color
        </p>

        {!isDropdownOpen ? (
          <Button onClick={() => setIsDropdownOpen(true)}>
            Begin experience
          </Button>
        ) : (
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <CustomDropdown
              options={dropdownOptions}
              onSelect={handleSpeechSelect}
              placeholder="Select a speech"
              isOpen={isDropdownOpen}
              onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

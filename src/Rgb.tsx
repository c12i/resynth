import { useEffect, useState } from "react";
import { emotionColorPalette, type EmotionType } from "./data";

// Flatten all unique colors from all emotion palettes into one array
const allColors = Array.from(
  new Set(Object.values(emotionColorPalette).flat()),
);

export const RGBVisualizer = ({ emotion }: { emotion: EmotionType }) => {
  const [activeColor, setActiveColor] = useState("");

  // Pick one color from the current emotion's palette
  useEffect(() => {
    const palette = emotionColorPalette[emotion];
    const picked = palette[Math.floor(Math.random() * palette.length)];
    setActiveColor(picked);
  }, [emotion]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "40px",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        zIndex: 2,
      }}
    >
      {allColors.map((color, index) => {
        const isActive = color === activeColor;

        return (
          <div
            key={index}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "4px",
              backgroundColor: isActive ? color : "rgba(50, 50, 50, 0.3)",
              transition: "background-color 1s ease-in-out, box-shadow 0.5s",
              boxShadow: isActive
                ? `0 0 8px ${color}, 0 0 20px ${color}`
                : "none",
            }}
          />
        );
      })}
    </div>
  );
};

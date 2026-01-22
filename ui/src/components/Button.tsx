import type { CSSProperties } from "react";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  style?: CSSProperties;
}

export function Button({ onClick, children, variant = "primary", style }: ButtonProps) {
  const baseStyle: CSSProperties = {
    padding: "1rem 3rem",
    fontSize: "1.25rem",
    fontWeight: "700",
    border: "none",
    borderRadius: "9999px", // Fully rounded corners
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: "'Work Sans', sans-serif",
    textTransform: "none", // No capitalization
  };

  const primaryStyle: CSSProperties = {
    ...baseStyle,
    color: "#000",
    background: "#fff",
  };

  const secondaryStyle: CSSProperties = {
    ...baseStyle,
    color: "#fff",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  const buttonStyle = variant === "primary" ? primaryStyle : secondaryStyle;

  return (
    <button
      onClick={onClick}
      style={{ ...buttonStyle, ...style }}
      onMouseEnter={(e) => {
        if (onClick) {
          if (variant === "primary") {
            e.currentTarget.style.background = "#ddd";
          } else {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          if (variant === "primary") {
            e.currentTarget.style.background = "#fff";
          } else {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }
        }
      }}
    >
      {children}
    </button>
  );
}


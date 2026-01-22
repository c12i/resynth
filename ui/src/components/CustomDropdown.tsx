import { useRef, useEffect } from "react";

interface DropdownOption {
  value: string | number;
  label: string;
  sublabel?: string; // For italic text like "(where + when)"
}

interface CustomDropdownProps {
  options: DropdownOption[];
  onSelect: (value: string | number) => void;
  placeholder?: string;
  buttonText?: string; // Custom button text instead of placeholder
  isOpen: boolean;
  onToggle: () => void;
}

export function CustomDropdown({
  options,
  onSelect,
  placeholder = "Select an option",
  buttonText,
  isOpen,
  onToggle,
}: CustomDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onToggle();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const handleSelect = (value: string | number) => {
    onSelect(value);
    onToggle(); // Close dropdown after selection
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "500px",
      }}
    >
      {/* Dropdown toggle button */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: buttonText ? "1rem 3rem" : "1rem 3rem",
          fontSize: buttonText ? "1.25rem" : "1.25rem",
          fontWeight: buttonText ? "700" : "700",
          color: buttonText ? "#000" : "#000",
          background: buttonText ? "#fff" : "#fff",
          border: "none",
          borderRadius: "9999px",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "2rem",
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
        <span>{buttonText || placeholder}</span>
        <span style={{ fontSize: "0.8rem" }}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            left: 0,
            right: 0,
            maxHeight: "400px",
            overflowY: "auto",
            background: "rgba(0, 0, 0, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "16px",
            zIndex: 1000,
            backdropFilter: "blur(10px)",
            // Hide scrollbar for all browsers
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE and Edge
          }}
          className="custom-dropdown-menu"
        >
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option.value)}
              style={{
                padding: "1rem 1.5rem",
                cursor: "pointer",
                borderBottom:
                  index < options.length - 1 ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ color: "#fff", fontSize: "1rem", marginBottom: "0.25rem", fontFamily: "'Work Sans', sans-serif", fontWeight: "500" }}>
                {option.label}
              </div>
              {option.sublabel && (
                <div
                  style={{
                    color: "#aaa",
                    fontSize: "0.9rem",
                    fontStyle: "italic",
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: "400",
                  }}
                >
                  {option.sublabel}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


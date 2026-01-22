module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        neutral: "#AAAAAA",
        joy: "#FFD700",
        anger: "#FF0040",
        sadness: "#3366FF",
        fear: "#9933FF",
        disgust: "#66CC33",
        surprise: "#FF66CC",
        muted: "#999999",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 12px rgba(255, 255, 255, 0.15)",
        emotion: "0 0 20px var(--tw-shadow-color)",
      },
      blur: {
        soft: "10px",
        glow: "20px",
      },
      spacing: {
        header: "10vh",
        footer: "8vh",
        content: "82vh",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.neutral"),
            a: { color: theme("colors.joy") },
            strong: { color: theme("colors.white") },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

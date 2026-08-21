/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          950: "#0A0E18",
          900: "#0F1524",
          800: "#141B30",
          700: "#1B2440",
          600: "#232D50",
          border: "#232B45",
        },
        signal: {
          DEFAULT: "#35E6C4",
          dim: "#1E8F7C",
          glow: "#7CFCE8",
        },
        decay: {
          DEFAULT: "#FF6B5B",
          dim: "#B94A40",
        },
        purpose: {
          DEFAULT: "#8B7FFF",
        },
        ink: {
          DEFAULT: "#E8ECF4",
          muted: "#8B94AC",
          faint: "#535D7A",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(53, 230, 196, 0.35)",
        "glow-decay": "0 0 40px -8px rgba(255, 107, 91, 0.3)",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: 0.7 },
          "80%": { transform: "scale(1.4)", opacity: 0 },
          "100%": { transform: "scale(1.4)", opacity: 0 },
        },
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        sweep: "sweep 4s linear infinite",
        "pulse-ring": "pulse-ring 2.5s cubic-bezier(0.2,0.6,0.4,1) infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
}


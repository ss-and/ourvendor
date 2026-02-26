import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── デザインシステム カラートークン ────────────────────────────
        primary: {
          DEFAULT: "#00B4A8",
          50:  "#E0F7F5",
          100: "#B3EBE7",
          200: "#80DDD8",
          300: "#4DCFC8",
          400: "#26C4BC",
          500: "#00B4A8",
          600: "#009D93",
          700: "#008279",
          800: "#006861",
          900: "#004B46",
        },
        sidebar: {
          bg:     "#1C2B3A",
          hover:  "#243445",
          active: "#1A3A4A",
          border: "#2D3F52",
        },
        surface: {
          bg:   "#EEF2F5",
          card: "#FFFFFF",
        },
        neutral: {
          50:  "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans JP", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card:  "0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.05)",
        modal: "0 20px 60px -10px rgba(0,0,0,.25)",
        glow:  "0 0 20px rgba(0,180,168,.35)",
      },
      animation: {
        "fade-in":   "fadeIn .2s ease-out",
        "slide-up":  "slideUp .25s ease-out",
        "bounce-sm": "bounceSm 1s infinite",
        "pulse-ring":"pulseRing 1.5s cubic-bezier(.4,0,.6,1) infinite",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn:   { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:  { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        bounceSm: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
        pulseRing:{ "0%,100%": { opacity: "1" }, "50%": { opacity: ".4" } },
      },
    },
  },
  plugins: [],
};

export default config;

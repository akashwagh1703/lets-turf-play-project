/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F9FA", // Light background
        foreground: "#222222", // Dark Text

        primary: {
          DEFAULT: "#1FAA59", // Vibrant Green
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#3A86FF", // Sky Blue
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#facc15", // Golden Yellow
          foreground: "#222222", // Dark Text for contrast
        },
        dark: {
          DEFAULT: "#222222",
          foreground: "#F8F9FA",
        },
        destructive: {
          DEFAULT: "#E74C3C",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#E9ECEF",
          foreground: "#555555",
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
      backgroundImage: {
        'login-hero': "url('https://images.unsplash.com/photo-1599499122472-358a4a5e4a83?fit=crop&w=1920&q=80')",
      }
    },
  },
  plugins: [],
};

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'glass-blur': {
          '0%': { backdropFilter: 'blur(0px)' },
          '100%': { backdropFilter: 'blur(16px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'glass-blur': 'glass-blur 0.7s ease-in',
      },
    },
  },
  plugins: [],
}; 
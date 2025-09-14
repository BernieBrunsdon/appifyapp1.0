module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'primary-bg': '#111827',
        'secondary-bg': '#1F2937',
        'accent-blue': '#2563EB',
        'accent-blue-hover': '#1D4ED8',
        'border-gray': '#374151',
        'text-primary': '#FFFFFF',
        'text-secondary': '#9CA3AF',
        'text-light': '#F9FAFB',
      },
      boxShadow: {
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.4)',
        'glow-blue-sm': '0 0 15px rgba(59, 130, 246, 0.3)',
      },
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
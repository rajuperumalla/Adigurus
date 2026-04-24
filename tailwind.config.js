/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./*.html"],
  safelist: [
    'text-earth', 'bg-earth', 'text-gold', 'bg-gold',
    'text-sandalwood', 'border-earth', 'border-gold',
    'from-earth', 'to-earth', 'from-gold', 'to-gold',
    'hover:text-earth', 'hover:bg-earth', 'hover:text-gold',
    'dark:text-sandalwood', 'dark:bg-earth',
    'glass', 'card-shadow', 'hover-zoom', 'page-content',
    'animate-float', 'animate-float-delayed', 'animate-pulse-slow',
    'earth', 'gold', 'sandalwood',
  ],
  theme: {
    extend: {
      colors: {
        earth: '#4A6741',
        gold: '#C8953A',
        sandalwood: '#E8D5B0',
        'earth-green': '#3d5c36',
        herbal: '#5a7a50',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'fadeIn': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

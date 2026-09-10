/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6EF',
        beige: '#E8DCC8',
        'beige-dark': '#D9C8A8',
        gold: '#C9A961',
        'gold-light': '#E0C896',
        maroon: '#7A1F2B',
        'maroon-dark': '#5C1620',
        brown: '#3D2B1F',
        'brown-light': '#6B5645',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Karla"', '"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'zari-border': "repeating-linear-gradient(90deg, transparent, transparent 6px, #C9A961 6px, #C9A961 8px)",
      },
    },
  },
  plugins: [],
};

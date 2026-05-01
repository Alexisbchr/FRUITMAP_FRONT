/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7f2',
          100: '#dceddf',
          200: '#bbdbc2',
          300: '#8ec49a',
          400: '#5ea870',
          500: '#3d8b52',
          600: '#2d6e3f',
          700: '#245834',
          800: '#1e452a',
          900: '#193923',
        },
        bark: {
          50:  '#faf6f0',
          100: '#f2eadb',
          200: '#e4d2b5',
          300: '#d4b589',
          400: '#c29660',
          500: '#b07d44',
          600: '#956537',
          700: '#7a4f2e',
          800: '#644029',
          900: '#523526',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

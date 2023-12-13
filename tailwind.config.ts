import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        mdl: { max: '768px' },
      },
      colors: {
        primary: '#011627',
        secondary: '#162938',
        highlight: '#FF9F1C',
        red: '#FF3A46',
        light: '#f0f8ff',
      },
    },
  },
  plugins: [],
};
export default config;

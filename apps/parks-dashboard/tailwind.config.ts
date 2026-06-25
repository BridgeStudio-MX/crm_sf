import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parks: {
          green: '#16A34A',
          yellow: '#D97706',
          red: '#DC2626',
          gray: '#6B7280',
          blue: '#2563EB',
        },
      },
    },
  },
  plugins: [],
};

export default config;

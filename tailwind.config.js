/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#ffffff',
          sidebar: '#f7f6f3',
          hover: '#efefef',
          border: '#e9e9e7',
          text: '#37352f',
          muted: '#787774',
          accent: '#2383e2',
          highlight: '#fef3c7',
          kp: '#dbeafe',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        popup: '0 4px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}

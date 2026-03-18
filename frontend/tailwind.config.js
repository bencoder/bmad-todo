/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f5f5f5',
        surface: '#fafafa',
        'text-primary': '#1a1a1a',
        'text-secondary': '#666666',
        'text-muted': '#888888',
        border: '#e0e0e0',
        primary: '#1e40af',
        'focus-ring': '#1e40af',
        error: '#dc2626',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        body: ['1rem', { lineHeight: '1.5' }],
        metadata: ['0.875rem', { lineHeight: '1.43' }],
      },
      spacing: {
        'add-row-gap': '8px',
        'list-gap': '8px',
        'section-bottom': '20px',
        'container-padding': '24px',
      },
      borderRadius: {
        card: '8px',
        input: '8px',
        button: '8px',
      },
    },
  },
  plugins: [],
}

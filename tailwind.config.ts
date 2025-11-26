import type { Config } from 'tailwindcss';

const config: Config = {
  // CRITICAL: Define all files that Tailwind should scan for class names.
  // This setup includes files in 'src/' ending with .js, .jsx, .ts, or .tsx.
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html', // Include the main index file if using standard Vite/CRA setup
  ],
  
  theme: {
    extend: {
      // You can define custom colors, fonts, spacing, etc., here.
      colors: {
        'primary-blue': '#1da1f2',
        'dark-gray': '#1f2937',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Add any official or third-party Tailwind plugins here
  ],
};

export default config;
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'primary': {
          DEFAULT: '#00B49B',
          '50': '#FFFFFF',
          '100': '#E7FFF8',
          '200': '#9BFFE6',
          '300': '#4EFFDA',
          '400': '#01FFD3',
          '500': '#00B49B',
          '600': '#00A594',
          '700': '#00958B',
          '800': '#008682',
          '900': '#007777'
        },
        'gray-500': '#9eaea4',
        'warning': '#FFA800',
        'warning-100': 'rgba(255, 168, 0, 0.1)',
        'gradient-start': '#06c17e',
        'gradient-end': '#06c1ab',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-warning',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'primary': {
          DEFAULT: '#00B49B',
          '50': '#EAFBF5',
          '100': '#D0F6EA',
          '200': '#A2F1D8',
          '300': '#76EFCD',
          '400': '#3CECC3',
          '500': '#09D7B2',
          '600': '#00B49B',
          '700': '#00A594',
          '800': '#00958B',
          '900': '#008682'
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

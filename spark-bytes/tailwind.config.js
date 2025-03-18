module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
      './app/**/*.{js,ts,jsx,tsx}', 
      './src/**/*.{js,ts,jsx,tsx}', 
    ],
    theme: {
      extend: {
        colors: {
          // BU colors
          'bu-red': '#cc0000',
          'bu-blue': '#2b73b6',
        },
      },
    },
    plugins: [],
  }
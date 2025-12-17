/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🔥 ESTA ES LA LÍNEA MÁGICA.
  // Le dice a Tailwind: "No uses el sistema, usa la clase 'dark' cuando yo la ponga".
  darkMode: 'class', 
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Aquí le decimos que busque clases en todos tus archivos de React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
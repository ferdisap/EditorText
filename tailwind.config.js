/** @type {import('tailwindcss').Config} */
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// export default {
//   darkMode: 'class',   // HARUS class
//   content: [
//     './index.html',
//     './src/**/*.{vue,js,ts,jsx,tsx}',
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
export default defineConfig({
  darkMode: 'class',   // HARUS class
  content: ['./index.html', './src/**/*.{vue,js,ts}', './resources/**/*.{vue,js,ts}'],
  plugins: [
    tailwindcss(),
    // …
  ],
})

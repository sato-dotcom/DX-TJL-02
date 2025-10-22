import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: 'components', replacement: path.resolve(__dirname, './src/components') },
      { find: 'hooks',      replacement: path.resolve(__dirname, './src/hooks') },
      { find: 'utils',      replacement: path.resolve(__dirname, './src/utils') },
      { find: 'constants',  replacement: path.resolve(__dirname, './src/constants') },

      // ここを修正: firebaseConfig.js だけ alias
      { find: /^firebase\/firebaseConfig$/, replacement: path.resolve(__dirname, './src/firebase/firebaseConfig.js') },
    ],
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
    ],
  },
});

import { defineConfig } from 'vite'
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from 'rollup-plugin-visualizer';
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tsconfigPaths(),
		visualizer({
			filename: 'stats.html',
			open: true,
			gzipSize: true,
			brotliSize: true,
		})
	],
	
})

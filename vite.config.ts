import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer';
import preact from "@preact/preset-vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		preact(),
		visualizer({
			filename: 'stats.html',
			open: true,
			gzipSize: true,
			brotliSize: true,
		})
	],
	resolve: {
		tsconfigPaths: true
	}
})

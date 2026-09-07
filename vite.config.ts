import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer';
import preact from "@preact/preset-vite";
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		preact(),
		visualizer({
			filename: 'stats.html',
			open: true,
			gzipSize: true,
			brotliSize: true,
		}),
		VitePWA({
			registerType: "autoUpdate",
			workbox: {
				runtimeCaching: [{
					urlPattern: /^https:\/\/dqmldihyiupobespwasu\.supabase\.co\/storage\/v1\/object\/public\//,
					handler: "StaleWhileRevalidate",
					options: {
						cacheName: "supabase-images",
						cacheableResponse: {
							statuses: [0, 200], 
						},
						expiration: {
							maxEntries: 100,
							maxAgeSeconds: 60 * 60 * 24 * 7,
						},
					},
				}]
			}
		}),
	],
	resolve: {
		tsconfigPaths: true
	}
})

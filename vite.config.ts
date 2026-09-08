import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import preact from "@preact/preset-vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		preact(),
		visualizer({
			filename: 'stats.html',
			open: false,
			gzipSize: true,
			brotliSize: true,
		}),
		VitePWA({
			injectRegister: "inline",
			registerType: "autoUpdate",
			workbox: {
				globPatterns: [
					"**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff,woff2,ttf}",
				],
				runtimeCaching: [{
					urlPattern: ({ url, request }) =>
						request.method === "GET" &&
						url.origin ===
						"https://dqmldihyiupobespwasu.supabase.co" &&
						url.pathname === "/rest/v1/General",

					handler: "NetworkFirst",

					options: {
						cacheName: "supabase-general",
						networkTimeoutSeconds: 3,

						cacheableResponse: {
							statuses: [0, 200],
						},

						expiration: {
							maxEntries: 10,
							maxAgeSeconds: 60 * 60 * 24 * 30,
						},
					},
				}]
			}
		}),
	],
	resolve: {
		tsconfigPaths: true
	}
});

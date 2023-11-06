import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import { resolve } from 'path';

export default defineConfig({
	plugins: [react(), eslint()],
	resolve: {
		alias: {
			src: resolve(__dirname, './src'),
			components: resolve(__dirname, './src/components'),
			pages: resolve(__dirname, './src/pages'),
			context: resolve(__dirname, './src/context'),
			styles: resolve(__dirname, './src/styles'),
			assets: resolve(__dirname, './src/assets'),
			nsfwjs: 'nsfwjs/dist/nsfwjs.min.js',
		},
	},
});

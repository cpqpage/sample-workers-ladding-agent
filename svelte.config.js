import adapter from '@sveltejs/adapter-cloudflare-workers';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess({
		postcss: true,
	}),

	kit: {
		adapter: adapter(),
		alias: {
			$lib: 'src/lib',
			$components: 'src/lib/components',
			$model: 'src/lib/server/model',
			$dao: 'src/lib/server/dao',
			$service: "src/lib/server/service",
		}
	}
};

export default config;

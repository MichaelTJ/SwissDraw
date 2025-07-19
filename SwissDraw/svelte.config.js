import adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: adapter({
			// Vercel adapter will handle the build output automatically
			// The build output will be in the 'build' directory
		})
	}
};



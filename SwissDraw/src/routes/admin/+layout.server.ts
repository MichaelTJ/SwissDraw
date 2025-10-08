import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isAdmin } from '$lib/users';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	
	// Redirect to home if not logged in
	if (!session?.user) {
		throw redirect(303, '/');
	}

	const user = locals.user;
	
	// Redirect to user area if not admin
	if (!isAdmin(user)) {
		throw redirect(303, '/user');
	}

	return {
		user,
		session
	};
};

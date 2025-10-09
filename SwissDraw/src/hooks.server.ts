import { handle as authHandle } from "./auth";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
import { getUserByEmail, ensureUserExists } from "$lib/users";
import { ADMIN_EMAIL } from "$env/static/private";

const authorizationHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();

	// If user is logged in, ensure they exist in our system
	if (session?.user?.email) {
		const user = await ensureUserExists({
			email: session.user.email,
			name: session.user.name || session.user.email,
			isDefaultAdmin: session.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
		});

		// Attach user info to locals for easy access
		event.locals.user = user;
	}

	return resolve(event);
};

export const handle = sequence(authHandle, authorizationHandle);

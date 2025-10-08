import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllUsers, updateUser, isAdmin } from '$lib/users';

// GET all users (admin only)
export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!isAdmin(user)) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const users = await getAllUsers();
	return json(users);
};

// POST to update user (admin or self)
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { userId, studentId, chessComUsername, role } = body;

	// Users can update their own studentId and chessComUsername
	// Only admins can update role
	if (userId !== user.id && !isAdmin(user)) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	// Prevent non-admins from changing roles
	if (role && !isAdmin(user)) {
		return json({ error: 'Only admins can change roles' }, { status: 403 });
	}

	const updates: any = {};
	if (studentId !== undefined) updates.studentId = studentId;
	if (chessComUsername !== undefined) updates.chessComUsername = chessComUsername;
	if (role !== undefined && isAdmin(user)) updates.role = role;

	const updatedUser = await updateUser(userId, updates);

	if (!updatedUser) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	return json(updatedUser);
};

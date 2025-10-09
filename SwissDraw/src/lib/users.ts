import type { User } from '../app.d';
import { randomUUID } from 'crypto';

// In-memory storage for Vercel compatibility
// Note: This will reset on each serverless function cold start
// For production, consider using Vercel KV or a database
let usersData: User[] = [];

/**
 * Load all users from memory
 */
export async function loadUsers(): Promise<User[]> {
	return usersData;
}

/**
 * Save users to memory
 */
async function saveUsers(users: User[]): Promise<void> {
	usersData = users;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
	const users = await loadUsers();
	return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
	const users = await loadUsers();
	return users.find((u) => u.id === id) || null;
}

/**
 * Ensure user exists, create if not
 */
export async function ensureUserExists(data: {
	email: string;
	name: string;
	isDefaultAdmin?: boolean;
}): Promise<User> {
	let user = await getUserByEmail(data.email);

	if (!user) {
		// Create new user
		user = {
			id: randomUUID(),
			email: data.email,
			name: data.name,
			role: data.isDefaultAdmin ? 'admin' : 'user',
			studentId: null,
			chessComUsername: null,
			createdAt: new Date().toISOString()
		};

		const users = await loadUsers();
		users.push(user);
		await saveUsers(users);
	} else if (data.isDefaultAdmin && user.role !== 'admin') {
		// Update existing user to admin if they should be admin
		const updatedUser = await updateUser(user.id, { role: 'admin' });
		if (updatedUser) {
			user = updatedUser;
		}
	}

	return user;
}

/**
 * Update user
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
	const users = await loadUsers();
	const index = users.findIndex((u) => u.id === id);

	if (index === -1) {
		return null;
	}

	users[index] = { ...users[index], ...updates };
	await saveUsers(users);
	return users[index];
}

/**
 * Link user to student
 */
export async function linkUserToStudent(
	userId: string,
	studentId: string,
	chessComUsername: string
): Promise<User | null> {
	return updateUser(userId, { studentId, chessComUsername });
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null | undefined): boolean {
	return user?.role === 'admin';
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
	return loadUsers();
}

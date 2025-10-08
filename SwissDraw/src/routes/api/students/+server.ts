import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isAdmin } from '$lib/users';

// In-memory storage for Vercel compatibility
// Note: This will reset on each serverless function cold start
// For production, consider using Vercel KV or a database
let studentsData: any[] = [
	{
		"id": "1758109941950",
		"name": "a",
		"score": 0,
		"chessComUsername": "",
		"wins": 0,
		"losses": 0,
		"draws": 0
	}
];

// Read students from memory
async function readStudents() {
	return studentsData;
}

// Write students to memory
async function writeStudents(students: any[]) {
	studentsData = students;
}

export const GET: RequestHandler = async ({ locals }) => {
	// Anyone authenticated can view students
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const students = await readStudents();
	return json(students);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	
	// Only admins can add students
	if (!isAdmin(user)) {
		return json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
	}

	const students = await readStudents();
	const { name, score, chessComUsername } = await request.json();
	
	// Validate chess.com username is provided
	if (!chessComUsername || chessComUsername.trim() === '') {
		return json({ error: 'Chess.com username is required' }, { status: 400 });
	}
	
	const newStudent = {
		id: Date.now().toString(),
		name: name.trim(),
		score: Number(score),
		chessComUsername: chessComUsername.trim(),
		wins: 0,
		losses: 0,
		draws: 0
	};
	
	students.push(newStudent);
	await writeStudents(students);
	
	return json(newStudent);
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	
	// Only admins can update students
	if (!isAdmin(user)) {
		return json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
	}

	const students = await readStudents();
	const { id, name, score, chessComUsername } = await request.json();
	
	const studentIndex = students.findIndex((s: any) => s.id === id);
	if (studentIndex === -1) {
		return json({ error: 'Student not found' }, { status: 404 });
	}
	
	// Validate chess.com username is provided if being updated
	if (chessComUsername !== undefined && chessComUsername.trim() === '') {
		return json({ error: 'Chess.com username is required' }, { status: 400 });
	}
	
	students[studentIndex] = {
		...students[studentIndex],
		name: name.trim(),
		score: Number(score),
		...(chessComUsername !== undefined && { chessComUsername: chessComUsername.trim() })
	};
	
	await writeStudents(students);
	return json(students[studentIndex]);
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	
	// Only admins can delete students
	if (!isAdmin(user)) {
		return json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
	}

	const students = await readStudents();
	const { id } = await request.json();
	
	const filteredStudents = students.filter((s: any) => s.id !== id);
	
	if (filteredStudents.length === students.length) {
		return json({ error: 'Student not found' }, { status: 404 });
	}
	
	await writeStudents(filteredStudents);
	return json({ success: true });
}; 
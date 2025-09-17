import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// In-memory storage for Vercel compatibility
// Note: This will reset on each serverless function cold start
// For production, consider using Vercel KV or a database
let studentsData: any[] = [
	{
		"id": "1758109941950",
		"name": "a",
		"score": 0
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

export const GET: RequestHandler = async () => {
	const students = await readStudents();
	return json(students);
};

export const POST: RequestHandler = async ({ request }) => {
	const students = await readStudents();
	const { name, score } = await request.json();
	
	const newStudent = {
		id: Date.now().toString(),
		name: name.trim(),
		score: Number(score)
	};
	
	students.push(newStudent);
	await writeStudents(students);
	
	return json(newStudent);
};

export const PUT: RequestHandler = async ({ request }) => {
	const students = await readStudents();
	const { id, name, score } = await request.json();
	
	const studentIndex = students.findIndex((s: any) => s.id === id);
	if (studentIndex === -1) {
		return json({ error: 'Student not found' }, { status: 404 });
	}
	
	students[studentIndex] = {
		...students[studentIndex],
		name: name.trim(),
		score: Number(score)
	};
	
	await writeStudents(students);
	return json(students[studentIndex]);
};

export const DELETE: RequestHandler = async ({ request }) => {
	const students = await readStudents();
	const { id } = await request.json();
	
	const filteredStudents = students.filter((s: any) => s.id !== id);
	
	if (filteredStudents.length === students.length) {
		return json({ error: 'Student not found' }, { status: 404 });
	}
	
	await writeStudents(filteredStudents);
	return json({ success: true });
}; 
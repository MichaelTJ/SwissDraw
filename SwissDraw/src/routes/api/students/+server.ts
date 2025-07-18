import { json } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

const DATA_FILE = path.join(process.cwd(), 'data', 'students.json');

// Ensure data directory exists
async function ensureDataDir() {
	const dataDir = path.dirname(DATA_FILE);
	try {
		await fs.access(dataDir);
	} catch {
		await fs.mkdir(dataDir, { recursive: true });
	}
}

// Read students from file
async function readStudents() {
	try {
		await ensureDataDir();
		const data = await fs.readFile(DATA_FILE, 'utf-8');
		return JSON.parse(data);
	} catch {
		// File doesn't exist or is invalid, return empty array
		return [];
	}
}

// Write students to file
async function writeStudents(students: any[]) {
	await ensureDataDir();
	await fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2));
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
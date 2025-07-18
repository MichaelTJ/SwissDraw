import { json } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import path from 'path';
import type { RequestHandler } from '@sveltejs/kit';

const DATA_FILE = path.join(process.cwd(), 'data', 'matches.json');

// Ensure data directory exists
async function ensureDataDir() {
	const dataDir = path.dirname(DATA_FILE);
	try {
		await fs.access(dataDir);
	} catch {
		await fs.mkdir(dataDir, { recursive: true });
	}
}

// Read matches from file
async function readMatches() {
	try {
		await ensureDataDir();
		const data = await fs.readFile(DATA_FILE, 'utf-8');
		const matches = JSON.parse(data);
		// Convert date strings back to Date objects
		return matches.map((match: any) => ({
			...match,
			date: new Date(match.date)
		}));
	} catch {
		// File doesn't exist or is invalid, return empty array
		return [];
	}
}

// Write matches to file
async function writeMatches(matches: any[]) {
	await ensureDataDir();
	await fs.writeFile(DATA_FILE, JSON.stringify(matches, null, 2));
}

export const GET: RequestHandler = async () => {
	const matches = await readMatches();
	return json(matches);
};

export const POST: RequestHandler = async ({ request }) => {
	const matches = await readMatches();
	const { playerA, playerB, winner, loser } = await request.json();
	
	const newMatch = {
		id: Date.now().toString(),
		playerA,
		playerB,
		winner,
		loser,
		date: new Date()
	};
	
	matches.push(newMatch);
	await writeMatches(matches);
	
	return json(newMatch);
};

export const DELETE: RequestHandler = async ({ request }) => {
	const matches = await readMatches();
	const { id } = await request.json();
	
	const filteredMatches = matches.filter((m: any) => m.id !== id);
	
	if (filteredMatches.length === matches.length) {
		return json({ error: 'Match not found' }, { status: 404 });
	}
	
	await writeMatches(filteredMatches);
	return json({ success: true });
}; 
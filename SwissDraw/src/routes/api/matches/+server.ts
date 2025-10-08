import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { isAdmin } from '$lib/users';

// In-memory storage for Vercel compatibility
// Note: This will reset on each serverless function cold start
// For production, consider using Vercel KV or a database
let matchesData: any[] = [];

// Read matches from memory
async function readMatches() {
	return matchesData;
}

// Write matches to memory
async function writeMatches(matches: any[]) {
	matchesData = matches;
}

export const GET: RequestHandler = async ({ locals }) => {
	// Anyone authenticated can view matches
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const matches = await readMatches();
	return json(matches);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	
	// Only admins can record matches
	if (!isAdmin(user)) {
		return json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
	}

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

export const DELETE: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	
	// Only admins can delete matches
	if (!isAdmin(user)) {
		return json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
	}

	const matches = await readMatches();
	const { id, studentId } = await request.json();
	
	let filteredMatches;
	
	// If studentId is provided, delete all matches for that student
	if (studentId) {
		filteredMatches = matches.filter((m: any) => 
			m.playerA !== studentId && m.playerB !== studentId
		);
	} else if (id) {
		// Otherwise, delete specific match by id
		filteredMatches = matches.filter((m: any) => m.id !== id);
		
		if (filteredMatches.length === matches.length) {
			return json({ error: 'Match not found' }, { status: 404 });
		}
	} else {
		return json({ error: 'Either id or studentId must be provided' }, { status: 400 });
	}
	
	await writeMatches(filteredMatches);
	return json({ success: true });
}; 
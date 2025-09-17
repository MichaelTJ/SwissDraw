import { writable, derived } from 'svelte/store';
import { getStudents, updateStudent } from './students';

export interface Match {
	id: string;
	playerA: string;
	playerB: string;
	winner: string;
	loser: string;
	date: Date;
}

// Create the match history store
export const matchHistory = writable<Match[]>([]);

// Load matches from server on initialization
if (typeof window !== 'undefined') {
	loadMatchesFromServer();
}

async function loadMatchesFromServer() {
	try {
		const response = await fetch('/api/matches');
		if (response.ok) {
			const matches = await response.json();
			matchHistory.set(matches);
		}
	} catch (error) {
		console.error('Error loading matches from server:', error);
		matchHistory.set([]);
	}
}

// Subscribe to changes and save to server
if (typeof window !== 'undefined') {
	matchHistory.subscribe(async (matches) => {
		// Don't save on initial load
		if (matches.length > 0) {
			try {
				await fetch('/api/matches', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(matches[matches.length - 1])
				});
			} catch (error) {
				console.error('Error saving match to server:', error);
			}
		}
	});
}

// Derived store for match statistics
export const matchStats = derived(matchHistory, ($matchHistory) => {
	const stats = new Map<string, { wins: number; losses: number; total: number }>();
	
	$matchHistory.forEach(match => {
		// Initialize stats for both players if not exists
		if (!stats.has(match.playerA)) {
			stats.set(match.playerA, { wins: 0, losses: 0, total: 0 });
		}
		if (!stats.has(match.playerB)) {
			stats.set(match.playerB, { wins: 0, losses: 0, total: 0 });
		}
		
		const playerAStats = stats.get(match.playerA)!;
		const playerBStats = stats.get(match.playerB)!;
		
		// Update stats
		if (match.winner === match.playerA) {
			playerAStats.wins++;
			playerBStats.losses++;
		} else {
			playerBStats.wins++;
			playerAStats.losses++;
		}
		
		playerAStats.total++;
		playerBStats.total++;
	});
	
	return stats;
});

/**
 * Record a match between two students
 * @param winnerId - ID of the winning student
 * @param loserId - ID of the losing student
 * @returns Promise<boolean> - true if match was recorded successfully
 */
export async function recordMatch(winnerId: string, loserId: string): Promise<boolean> {
	// Check if players can play
	if (!canPlay(winnerId, loserId)) {
		console.error('Players cannot play another match');
		return false;
	}
	
	try {
		// Create new match
		const newMatch: Match = {
			id: Date.now().toString(),
			playerA: winnerId,
			playerB: loserId,
			winner: winnerId,
			loser: loserId,
			date: new Date()
		};
		
		// Add to match history
		matchHistory.update(matches => [...matches, newMatch]);
		
		// Update student scores
		const students = await getStudents();
		const winner = students.find(s => s.id === winnerId);
		const loser = students.find(s => s.id === loserId);
		
		if (winner && loser) {
			// Update winner score (+1)
			await updateStudent(winnerId, winner.name, winner.score + 1);
			
			// Update loser score (-1)
			await updateStudent(loserId, loser.name, loser.score - 1);
		}
		
		return true;
	} catch (error) {
		console.error('Error recording match:', error);
		return false;
	}
}

/**
 * Check if two students can legally play another match
 * @param studentA - ID of first student
 * @param studentB - ID of second student
 * @returns boolean - true if they can play
 */
export function canPlay(studentA: string, studentB: string): boolean {
	let matches: Match[] = [];
	
	// Get current matches from store
	const unsubscribe = matchHistory.subscribe(m => {
		matches = m;
	});
	unsubscribe();
	
	// Get matches between these two students
	const matchesBetweenPlayers = matches.filter(match => 
		(match.playerA === studentA && match.playerB === studentB) ||
		(match.playerA === studentB && match.playerB === studentA)
	);
	
	// If they've played less than 3 times, they can play
	if (matchesBetweenPlayers.length < 3) {
		return true;
	}
	
	// If they've played exactly 3 times, check if it's a best-of-3 scenario
	if (matchesBetweenPlayers.length === 3) {
		const studentAWins = matchesBetweenPlayers.filter(match => 
			match.winner === studentA
		).length;
		
		const studentBWins = matchesBetweenPlayers.filter(match => 
			match.winner === studentB
		).length;
		
		// If one player has won 2 out of 3, they can play one more time
		if (studentAWins === 2 || studentBWins === 2) {
			return true;
		}
	}
	
	// Otherwise, they cannot play
	return false;
}

/**
 * Get match history for a specific student
 * @param studentId - ID of the student
 * @returns Match[] - Array of matches the student has played in
 */
export function getMatchHistory(studentId: string): Match[] {
	let matches: Match[] = [];
	
	// Get current matches from store
	const unsubscribe = matchHistory.subscribe(m => {
		matches = m;
	});
	unsubscribe();
	
	return matches.filter(match => 
		match.playerA === studentId || match.playerB === studentId
	);
}

/**
 * Get matches between two specific students
 * @param studentA - ID of first student
 * @param studentB - ID of second student
 * @returns Match[] - Array of matches between these students
 */
export function getMatchesBetweenStudents(studentA: string, studentB: string): Match[] {
	let matches: Match[] = [];
	
	// Get current matches from store
	const unsubscribe = matchHistory.subscribe(m => {
		matches = m;
	});
	unsubscribe();
	
	return matches.filter(match => 
		(match.playerA === studentA && match.playerB === studentB) ||
		(match.playerA === studentB && match.playerB === studentA)
	);
}

/**
 * Get match statistics for a specific student
 * @param studentId - ID of the student
 * @returns {wins: number, losses: number, total: number} - Match statistics
 */
export function getStudentMatchStats(studentId: string): { wins: number; losses: number; total: number } {
	let stats: Map<string, { wins: number; losses: number; total: number }> = new Map();
	
	// Get current stats from store
	const unsubscribe = matchStats.subscribe(s => {
		stats = s;
	});
	unsubscribe();
	
	return stats.get(studentId) || { wins: 0, losses: 0, total: 0 };
}

/**
 * Clear all match history
 */
export function clearMatchHistory(): void {
	matchHistory.set([]);
}

/**
 * Delete a specific match
 * @param matchId - ID of the match to delete
 * @returns boolean - true if match was deleted successfully
 */
export async function deleteMatch(matchId: string): Promise<boolean> {
	try {
		let matches: Match[] = [];
		
		// Get current matches from store
		const unsubscribe = matchHistory.subscribe(m => {
			matches = m;
		});
		unsubscribe();
		
		const matchToDelete = matches.find(m => m.id === matchId);
		if (!matchToDelete) {
			return false;
		}
		
		// Remove match from history
		matchHistory.update(matches => matches.filter(m => m.id !== matchId));
		
		// Revert score changes
		const students = await getStudents();
		const winner = students.find(s => s.id === matchToDelete.winner);
		const loser = students.find(s => s.id === matchToDelete.loser);
		
		if (winner && loser) {
			// Revert winner score (-1)
			await updateStudent(matchToDelete.winner, winner.name, winner.score - 1);
			
			// Revert loser score (+1)
			await updateStudent(matchToDelete.loser, loser.name, loser.score + 1);
		}
		
		return true;
	} catch (error) {
		console.error('Error deleting match:', error);
		return false;
	}
}

/**
 * Delete all matches for a specific student
 * @param studentId - ID of the student whose matches should be deleted
 * @returns boolean - true if matches were deleted successfully
 */
export async function deleteMatchesByStudent(studentId: string): Promise<boolean> {
	try {
		let matches: Match[] = [];
		
		// Get current matches from store
		const unsubscribe = matchHistory.subscribe(m => {
			matches = m;
		});
		unsubscribe();
		
		// Find all matches involving this student
		const matchesToDelete = matches.filter(match => 
			match.playerA === studentId || match.playerB === studentId
		);
		
		if (matchesToDelete.length === 0) {
			return true; // No matches to delete
		}
		
		// Call API to delete matches from server
		const response = await fetch('/api/matches', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ studentId })
		});
		
		if (!response.ok) {
			throw new Error('Failed to delete matches from server');
		}
		
		// Remove all matches involving this student from history
		matchHistory.update(matches => 
			matches.filter(match => 
				match.playerA !== studentId && match.playerB !== studentId
			)
		);
		
		// Revert score changes for all matches involving this student
		const students = await getStudents();
		
		for (const match of matchesToDelete) {
			const otherPlayerId = match.playerA === studentId ? match.playerB : match.playerA;
			const otherPlayer = students.find(s => s.id === otherPlayerId);
			
			if (otherPlayer) {
				// Revert the other player's score change
				if (match.winner === otherPlayerId) {
					// Other player won, so revert their +1 score
					await updateStudent(otherPlayerId, otherPlayer.name, otherPlayer.score - 1);
				} else {
					// Other player lost, so revert their -1 score
					await updateStudent(otherPlayerId, otherPlayer.name, otherPlayer.score + 1);
				}
			}
		}
		
		return true;
	} catch (error) {
		console.error('Error deleting matches for student:', error);
		return false;
	}
} 
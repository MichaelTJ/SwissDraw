import type { Student } from './students';
import type { Match } from './matches';

export interface LeaderboardEntry {
	student: Student;
	wins: number;
	losses: number;
	totalMatches: number;
	winRate: number;
}

export interface StudentStats {
	wins: number;
	losses: number;
	totalMatches: number;
	winRate: number;
}

/**
 * Calculate win/loss statistics for a specific student from match history
 * @param studentId - ID of the student
 * @param matches - Array of all matches
 * @returns StudentStats object with wins, losses, total matches, and win rate
 */
export function calculateStudentStats(studentId: string, matches: Match[]): StudentStats {
	let wins = 0;
	let losses = 0;
	
	matches.forEach(match => {
		if (match.playerA === studentId || match.playerB === studentId) {
			if (match.winner === studentId) {
				wins++;
			} else {
				losses++;
			}
		}
	});
	
	const totalMatches = wins + losses;
	const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
	
	return {
		wins,
		losses,
		totalMatches,
		winRate
	};
}

/**
 * Get leaderboard with students sorted by score (descending)
 * @param students - Array of all students
 * @param matches - Array of all matches
 * @returns Array of LeaderboardEntry objects sorted by score
 */
export function getLeaderboard(students: Student[], matches: Match[]): LeaderboardEntry[] {
	return students
		.map(student => {
			const stats = calculateStudentStats(student.id, matches);
			return {
				student,
				...stats
			};
		})
		.sort((a, b) => {
			// Primary sort: by score (descending)
			if (b.student.score !== a.student.score) {
				return b.student.score - a.student.score;
			}
			// Secondary sort: by win rate (descending)
			if (b.winRate !== a.winRate) {
				return b.winRate - a.winRate;
			}
			// Tertiary sort: by total matches (descending)
			if (b.totalMatches !== a.totalMatches) {
				return b.totalMatches - a.totalMatches;
			}
			// Final sort: by name (ascending)
			return a.student.name.localeCompare(b.student.name);
		});
}

/**
 * Get top N students from leaderboard
 * @param students - Array of all students
 * @param matches - Array of all matches
 * @param limit - Number of top students to return
 * @returns Array of top N LeaderboardEntry objects
 */
export function getTopStudents(students: Student[], matches: Match[], limit: number = 10): LeaderboardEntry[] {
	return getLeaderboard(students, matches).slice(0, limit);
}

/**
 * Get student rank in leaderboard
 * @param studentId - ID of the student
 * @param students - Array of all students
 * @param matches - Array of all matches
 * @returns Rank (1-based) or -1 if student not found
 */
export function getStudentRank(studentId: string, students: Student[], matches: Match[]): number {
	const leaderboard = getLeaderboard(students, matches);
	const index = leaderboard.findIndex(entry => entry.student.id === studentId);
	return index >= 0 ? index + 1 : -1;
}

/**
 * Format win rate as percentage string
 * @param winRate - Win rate as decimal (0-1)
 * @returns Formatted percentage string
 */
export function formatWinRate(winRate: number): string {
	return `${winRate.toFixed(1)}%`;
}

/**
 * Get medal emoji for rank position
 * @param rank - Rank position (1-based)
 * @returns Medal emoji or empty string
 */
export function getMedalEmoji(rank: number): string {
	switch (rank) {
		case 1:
			return '🥇';
		case 2:
			return '🥈';
		case 3:
			return '🥉';
		default:
			return '';
	}
} 
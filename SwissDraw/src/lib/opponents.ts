import type { Student } from './students';
import type { Match } from './matches';
import { canPlay, getMatchesBetweenStudents } from './matches';
import { getStudents } from './students';

export interface MatchResult {
	id: string;
	playerA: string;
	playerB: string;
	winner: string;
	loser: string;
	date: Date;
}

/**
 * Get all matches between two specific students
 * @param studentA - ID of first student
 * @param studentB - ID of second student
 * @returns MatchResult[] - Array of matches between these students
 */
export function getHeadToHead(studentA: string, studentB: string): MatchResult[] {
	const matches = getMatchesBetweenStudents(studentA, studentB);
	return matches.map(match => ({
		id: match.id,
		playerA: match.playerA,
		playerB: match.playerB,
		winner: match.winner,
		loser: match.loser,
		date: match.date
	}));
}

/**
 * Check if two students can have a best-of-3 rematch
 * @param studentA - ID of first student
 * @param studentB - ID of second student
 * @returns boolean - true if they can have a best-of-3 rematch
 */
function canHaveBestOfThreeRematch(studentA: string, studentB: string): boolean {
	const headToHead = getHeadToHead(studentA, studentB);
	
	// Need exactly 3 matches to consider best-of-3
	if (headToHead.length !== 3) {
		return false;
	}
	
	const studentAWins = headToHead.filter(match => match.winner === studentA).length;
	const studentBWins = headToHead.filter(match => match.winner === studentB).length;
	
	// If one player has won 2 out of 3, they can play one more time for best-of-3
	return studentAWins === 2 || studentBWins === 2;
}

/**
 * Check if score difference is within the specified margin
 * @param scoreA - Score of first student
 * @param scoreB - Score of second student
 * @param margin - Maximum allowed score difference
 * @returns boolean - true if scores are within margin
 */
function isScoreWithinMargin(scoreA: number, scoreB: number, margin: number): boolean {
	return Math.abs(scoreA - scoreB) <= margin;
}

/**
 * Get eligible opponents for a student based on score similarity and match history
 * @param studentId - ID of the student looking for opponents
 * @param margin - Maximum score difference allowed (default: 1)
 * @returns Promise<Student[]> - Array of eligible opponent students
 */
export async function getEligibleOpponents(studentId: string, margin: number = 1): Promise<Student[]> {
	// Get current students
	const students = await getStudents();
	
	// Find the target student
	const targetStudent = students.find(s => s.id === studentId);
	if (!targetStudent) {
		return [];
	}
	
	// Filter eligible opponents
	return students.filter(opponent => {
		// Exclude the student themselves
		if (opponent.id === studentId) {
			return false;
		}
		
		// Check if score difference is within margin
		if (!isScoreWithinMargin(targetStudent.score, opponent.score, margin)) {
			return false;
		}
		
		// Check if they can legally play using existing canPlay function
		if (!canPlay(studentId, opponent.id)) {
			// Special case: if they've played 3 times, check for best-of-3 rematch
			if (getHeadToHead(studentId, opponent.id).length === 3) {
				return canHaveBestOfThreeRematch(studentId, opponent.id);
			}
			return false;
		}
		
		return true;
	});
}

/**
 * Get eligible opponents with additional metadata
 * @param studentId - ID of the student looking for opponents
 * @param margin - Maximum score difference allowed (default: 1)
 * @returns Promise<Array> - Array of objects with student and match count information
 */
export async function getEligibleOpponentsWithDetails(studentId: string, margin: number = 1): Promise<Array<{
	student: Student;
	matchCount: number;
	lastPlayed?: Date;
	scoreDifference: number;
}>> {
	const students = await getStudents();
	const targetStudent = students.find(s => s.id === studentId);
	
	if (!targetStudent) {
		return [];
	}
	
	const eligibleOpponents = await getEligibleOpponents(studentId, margin);
	
	return eligibleOpponents.map(opponent => {
		const headToHead = getHeadToHead(studentId, opponent.id);
		const lastMatch = headToHead.length > 0 
			? headToHead.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
			: null;
		
		return {
			student: opponent,
			matchCount: headToHead.length,
			lastPlayed: lastMatch ? lastMatch.date : undefined,
			scoreDifference: Math.abs(targetStudent.score - opponent.score)
		};
	}).sort((a, b) => {
		// Sort by score difference (closest first), then by match count (fewer matches first)
		if (a.scoreDifference !== b.scoreDifference) {
			return a.scoreDifference - b.scoreDifference;
		}
		return a.matchCount - b.matchCount;
	});
}

/**
 * Get the best opponent recommendation for a student
 * @param studentId - ID of the student looking for an opponent
 * @param margin - Maximum score difference allowed (default: 1)
 * @returns Promise<Student | null> - Best recommended opponent or null if none available
 */
export async function getBestOpponentRecommendation(studentId: string, margin: number = 1): Promise<Student | null> {
	const eligibleOpponents = await getEligibleOpponentsWithDetails(studentId, margin);
	return eligibleOpponents.length > 0 ? eligibleOpponents[0].student : null;
}

/**
 * Get multiple opponent recommendations sorted by preference
 * @param studentId - ID of the student looking for opponents
 * @param margin - Maximum score difference allowed (default: 1)
 * @param limit - Maximum number of recommendations to return (default: 5)
 * @returns Promise<Student[]> - Array of recommended opponents sorted by preference
 */
export async function getOpponentRecommendations(studentId: string, margin: number = 1, limit: number = 5): Promise<Student[]> {
	const eligibleOpponents = await getEligibleOpponentsWithDetails(studentId, margin);
	return eligibleOpponents.slice(0, limit).map(opponent => opponent.student);
}

/**
 * Check if a student has any eligible opponents
 * @param studentId - ID of the student to check
 * @param margin - Maximum score difference allowed (default: 1)
 * @returns Promise<boolean> - true if student has eligible opponents
 */
export async function hasEligibleOpponents(studentId: string, margin: number = 1): Promise<boolean> {
	const eligibleOpponents = await getEligibleOpponents(studentId, margin);
	return eligibleOpponents.length > 0;
}

/**
 * Get statistics about opponent availability for a student
 * @param studentId - ID of the student to analyze
 * @param margin - Maximum score difference allowed (default: 1)
 * @returns Promise<Object> - Object with statistics about opponent availability
 */
export async function getOpponentAvailabilityStats(studentId: string, margin: number = 1): Promise<{
	totalStudents: number;
	eligibleOpponents: number;
	withinMargin: number;
	excludedByMatchLimit: number;
	excludedByScore: number;
}> {
	const students = await getStudents();
	const targetStudent = students.find(s => s.id === studentId);
	
	if (!targetStudent) {
		return {
			totalStudents: 0,
			eligibleOpponents: 0,
			withinMargin: 0,
			excludedByMatchLimit: 0,
			excludedByScore: 0
		};
	}
	
	let withinMargin = 0;
	let excludedByMatchLimit = 0;
	let excludedByScore = 0;
	
	students.forEach(opponent => {
		if (opponent.id === studentId) return;
		
		if (!isScoreWithinMargin(targetStudent.score, opponent.score, margin)) {
			excludedByScore++;
			return;
		}
		
		withinMargin++;
		
		if (!canPlay(studentId, opponent.id)) {
			// Check if it's due to match limit (not best-of-3 scenario)
			const headToHead = getHeadToHead(studentId, opponent.id);
			if (headToHead.length >= 3 && !canHaveBestOfThreeRematch(studentId, opponent.id)) {
				excludedByMatchLimit++;
			}
		}
	});
	
	const eligibleOpponents = await getEligibleOpponents(studentId, margin);
	
	return {
		totalStudents: students.length - 1, // Exclude self
		eligibleOpponents: eligibleOpponents.length,
		withinMargin,
		excludedByMatchLimit,
		excludedByScore
	};
} 
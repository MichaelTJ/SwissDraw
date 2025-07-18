import type { Student } from './students';
import { getEligibleOpponents } from './opponents';
import { canPlay } from './matches';

export interface MatchRecommendation {
	playerA: Student;
	playerB: Student;
	scoreDifference: number;
}

export interface MatchPairing {
	playerA: Student;
	playerB: Student;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns Shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * Get match recommendations for all students
 * @param students - Array of all students
 * @param margin - Maximum score difference allowed (default: 1)
 * @returns Promise<MatchRecommendation[]> - Array of recommended match pairings
 */
export async function getMatchRecommendations(
	students: Student[], 
	margin: number = 1
): Promise<MatchRecommendation[]> {
	if (students.length < 2) {
		return [];
	}

	const recommendations: MatchRecommendation[] = [];
	const usedStudents = new Set<string>();

	// Shuffle students to ensure fair distribution
	const shuffledStudents = shuffleArray(students);

	for (const student of shuffledStudents) {
		// Skip if student is already paired
		if (usedStudents.has(student.id)) {
			continue;
		}

		// Get eligible opponents for this student
		const eligibleOpponents = await getEligibleOpponents(student.id, margin);
		
		// Filter out opponents that are already paired
		const availableOpponents = eligibleOpponents.filter(
			opponent => !usedStudents.has(opponent.id)
		);

		// Find the best opponent (closest score, fewest matches)
		if (availableOpponents.length > 0) {
			// Sort by score difference, then by match count
			const sortedOpponents = availableOpponents.sort((a, b) => {
				const scoreDiffA = Math.abs(student.score - a.score);
				const scoreDiffB = Math.abs(student.score - b.score);
				
				if (scoreDiffA !== scoreDiffB) {
					return scoreDiffA - scoreDiffB;
				}
				
				// If score difference is the same, prefer opponent with fewer matches
				// This is a simple heuristic - in a real implementation you might want
				// to get actual match counts from the match history
				return 0; // For now, just use score difference
			});

			const bestOpponent = sortedOpponents[0];
			
			// Double-check they can still play (in case of race conditions)
			if (canPlay(student.id, bestOpponent.id)) {
				recommendations.push({
					playerA: student,
					playerB: bestOpponent,
					scoreDifference: Math.abs(student.score - bestOpponent.score)
				});

				// Mark both students as used
				usedStudents.add(student.id);
				usedStudents.add(bestOpponent.id);
			}
		}
	}

	return recommendations;
}

/**
 * Get match recommendations with additional metadata
 * @param students - Array of all students
 * @param margin - Maximum score difference allowed (default: 1)
 * @returns Promise<Array> - Array of recommendations with metadata
 */
export async function getMatchRecommendationsWithDetails(
	students: Student[], 
	margin: number = 1
): Promise<Array<MatchRecommendation & {
	matchCount: number;
	lastPlayed?: Date;
}>> {
	const recommendations = await getMatchRecommendations(students, margin);
	
	// Import getHeadToHead to get match history
	const { getHeadToHead } = await import('./opponents');
	
	return recommendations.map(recommendation => {
		const headToHead = getHeadToHead(recommendation.playerA.id, recommendation.playerB.id);
		const lastMatch = headToHead.length > 0 
			? headToHead.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
			: null;
		
		return {
			...recommendation,
			matchCount: headToHead.length,
			lastPlayed: lastMatch ? lastMatch.date : undefined
		};
	});
}

/**
 * Get match recommendations optimized for tournament fairness
 * @param students - Array of all students
 * @param margin - Maximum score difference allowed (default: 1)
 * @returns Promise<MatchRecommendation[]> - Optimized match recommendations
 */
export async function getOptimizedMatchRecommendations(
	students: Student[], 
	margin: number = 1
): Promise<MatchRecommendation[]> {
	if (students.length < 2) {
		return [];
	}

	// Sort students by score to prioritize fair matchups
	const sortedStudents = [...students].sort((a, b) => b.score - a.score);
	const recommendations: MatchRecommendation[] = [];
	const usedStudents = new Set<string>();

	for (const student of sortedStudents) {
		if (usedStudents.has(student.id)) {
			continue;
		}

		const eligibleOpponents = await getEligibleOpponents(student.id, margin);
		const availableOpponents = eligibleOpponents.filter(
			opponent => !usedStudents.has(opponent.id)
		);

		if (availableOpponents.length > 0) {
			// Find opponent with closest score
			const bestOpponent = availableOpponents.reduce((best, current) => {
				const bestDiff = Math.abs(student.score - best.score);
				const currentDiff = Math.abs(student.score - current.score);
				return currentDiff < bestDiff ? current : best;
			});

			if (canPlay(student.id, bestOpponent.id)) {
				recommendations.push({
					playerA: student,
					playerB: bestOpponent,
					scoreDifference: Math.abs(student.score - bestOpponent.score)
				});

				usedStudents.add(student.id);
				usedStudents.add(bestOpponent.id);
			}
		}
	}

	return recommendations;
}

/**
 * Check if there are any possible match recommendations
 * @param students - Array of all students
 * @param margin - Maximum score difference allowed (default: 1)
 * @returns Promise<boolean> - true if recommendations are possible
 */
export async function hasPossibleMatchRecommendations(
	students: Student[], 
	margin: number = 1
): Promise<boolean> {
	if (students.length < 2) {
		return false;
	}

	// Check if any student has eligible opponents
	for (const student of students) {
		const eligibleOpponents = await getEligibleOpponents(student.id, margin);
		if (eligibleOpponents.length > 0) {
			return true;
		}
	}

	return false;
}

/**
 * Get statistics about match recommendation availability
 * @param students - Array of all students
 * @param margin - Maximum score difference allowed (default: 1)
 * @returns Promise<Object> - Statistics about recommendation availability
 */
export async function getMatchRecommendationStats(
	students: Student[], 
	margin: number = 1
): Promise<{
	totalStudents: number;
	studentsWithOpponents: number;
	possibleMatches: number;
	averageScoreDifference: number;
}> {
	if (students.length < 2) {
		return {
			totalStudents: students.length,
			studentsWithOpponents: 0,
			possibleMatches: 0,
			averageScoreDifference: 0
		};
	}

	let studentsWithOpponents = 0;
	let totalPossibleMatches = 0;
	let totalScoreDifference = 0;
	let matchCount = 0;

	for (const student of students) {
		const eligibleOpponents = await getEligibleOpponents(student.id, margin);
		if (eligibleOpponents.length > 0) {
			studentsWithOpponents++;
			totalPossibleMatches += eligibleOpponents.length;
			
			// Calculate average score difference
			eligibleOpponents.forEach(opponent => {
				totalScoreDifference += Math.abs(student.score - opponent.score);
				matchCount++;
			});
		}
	}

	return {
		totalStudents: students.length,
		studentsWithOpponents,
		possibleMatches: totalPossibleMatches,
		averageScoreDifference: matchCount > 0 ? totalScoreDifference / matchCount : 0
	};
} 
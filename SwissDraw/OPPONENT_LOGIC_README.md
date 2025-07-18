# SwissDraw Opponent Recommendation Logic

This document describes the opponent recommendation system that finds suitable opponents based on similar scores and match history.

## Overview

The opponent recommendation system helps tournament organizers find fair and balanced matchups by considering:
- **Score Similarity**: Opponents with similar scores (±1 point by default)
- **Match History**: Respects existing match limits and best-of-3 scenarios
- **Fair Play**: Ensures students don't play the same opponent too frequently

## Core Functions

### 1. `getEligibleOpponents(studentId: string, margin: number = 1): Promise<Student[]>`

**Purpose**: Returns a list of students that the given student can legally play, whose scores are within the specified margin.

**Parameters**:
- `studentId`: ID of the student looking for opponents
- `margin`: Maximum score difference allowed (default: 1)

**Returns**: Promise<Student[]> - Array of eligible opponent students

**Filtering Rules**:
1. **Exclude self**: Student cannot play against themselves
2. **Score margin**: Opponent's score must be within ±margin points
3. **Match limits**: Respects existing `canPlay()` logic
4. **Best-of-3 exception**: Allows rematch if one player won 2 out of 3 previous matches

**Example**:
```typescript
import { getEligibleOpponents } from '$lib/opponents';

const eligibleOpponents = await getEligibleOpponents('student123', 2);
// Returns students with scores within ±2 points who can legally play
```

### 2. `getHeadToHead(studentA: string, studentB: string): MatchResult[]`

**Purpose**: Returns all matches between two specific students.

**Parameters**:
- `studentA`: ID of first student
- `studentB`: ID of second student

**Returns**: MatchResult[] - Array of matches between these students

**Example**:
```typescript
import { getHeadToHead } from '$lib/opponents';

const matches = getHeadToHead('student123', 'student456');
// Returns all matches between these two students
```

## Advanced Functions

### 3. `getEligibleOpponentsWithDetails(studentId: string, margin: number = 1): Promise<Array>`

**Purpose**: Returns eligible opponents with additional metadata for better decision making.

**Returns**: Promise<Array> with objects containing:
- `student`: Student object
- `matchCount`: Number of previous matches between these students
- `lastPlayed`: Date of last match (if any)
- `scoreDifference`: Absolute difference in scores

**Example**:
```typescript
const opponentsWithDetails = await getEligibleOpponentsWithDetails('student123', 1);
// Returns detailed information about each eligible opponent
```

### 4. `getBestOpponentRecommendation(studentId: string, margin: number = 1): Promise<Student | null>`

**Purpose**: Returns the single best opponent recommendation.

**Returns**: Promise<Student | null> - Best recommended opponent or null if none available

**Selection Criteria**:
1. Smallest score difference
2. Fewest previous matches
3. Alphabetical name order (tiebreaker)

**Example**:
```typescript
const bestOpponent = await getBestOpponentRecommendation('student123', 1);
if (bestOpponent) {
    console.log(`Best opponent: ${bestOpponent.name} (Score: ${bestOpponent.score})`);
}
```

### 5. `getOpponentRecommendations(studentId: string, margin: number = 1, limit: number = 5): Promise<Student[]>`

**Purpose**: Returns multiple opponent recommendations sorted by preference.

**Parameters**:
- `studentId`: ID of the student looking for opponents
- `margin`: Maximum score difference allowed (default: 1)
- `limit`: Maximum number of recommendations to return (default: 5)

**Returns**: Promise<Student[]> - Array of recommended opponents sorted by preference

**Example**:
```typescript
const recommendations = await getOpponentRecommendations('student123', 1, 3);
// Returns top 3 opponent recommendations
```

### 6. `hasEligibleOpponents(studentId: string, margin: number = 1): Promise<boolean>`

**Purpose**: Quick check if a student has any eligible opponents.

**Returns**: Promise<boolean> - true if student has eligible opponents

**Example**:
```typescript
const hasOpponents = await hasEligibleOpponents('student123', 1);
if (!hasOpponents) {
    console.log('No suitable opponents found');
}
```

### 7. `getOpponentAvailabilityStats(studentId: string, margin: number = 1): Promise<Object>`

**Purpose**: Provides detailed statistics about opponent availability.

**Returns**: Promise<Object> with statistics:
- `totalStudents`: Total number of other students
- `eligibleOpponents`: Number of eligible opponents
- `withinMargin`: Number of students within score margin
- `excludedByMatchLimit`: Number excluded due to match limits
- `excludedByScore`: Number excluded due to score difference

**Example**:
```typescript
const stats = await getOpponentAvailabilityStats('student123', 1);
console.log(`${stats.eligibleOpponents} out of ${stats.totalStudents} students are eligible`);
```

## Helper Functions

### `canHaveBestOfThreeRematch(studentA: string, studentB: string): boolean`

**Purpose**: Checks if two students can have a best-of-3 rematch.

**Logic**: Returns true if:
- They've played exactly 3 matches
- One player has won 2 out of 3 matches

### `isScoreWithinMargin(scoreA: number, scoreB: number, margin: number): boolean`

**Purpose**: Checks if score difference is within specified margin.

**Returns**: true if |scoreA - scoreB| ≤ margin

## Integration with Existing System

### Data Sources
- **Students**: Uses `getStudents()` from `$lib/students`
- **Match History**: Uses existing `canPlay()` and `getMatchesBetweenStudents()` from `$lib/matches`

### Match Validation
The system respects all existing match validation rules:
- Maximum 3 matches between same players (unless best-of-3 scenario)
- Proper score updates (+1 for win, -1 for loss)
- Match history tracking

## Usage Examples

### Basic Opponent Finding
```typescript
import { getEligibleOpponents } from '$lib/opponents';

// Find opponents within ±1 point
const opponents = await getEligibleOpponents('student123', 1);

// Find opponents within ±2 points
const moreOpponents = await getEligibleOpponents('student123', 2);
```

### Tournament Pairing
```typescript
import { getBestOpponentRecommendation } from '$lib/opponents';

// Get best opponent for each student
for (const student of students) {
    const opponent = await getBestOpponentRecommendation(student.id, 1);
    if (opponent) {
        console.log(`${student.name} vs ${opponent.name}`);
    }
}
```

### Analysis and Reporting
```typescript
import { getOpponentAvailabilityStats } from '$lib/opponents';

// Analyze opponent availability for all students
for (const student of students) {
    const stats = await getOpponentAvailabilityStats(student.id, 1);
    console.log(`${student.name}: ${stats.eligibleOpponents} eligible opponents`);
}
```

## Performance Considerations

- **Async Operations**: All functions are async to handle data fetching
- **Efficient Filtering**: Uses existing optimized functions from matches module
- **Caching**: Leverages existing store subscriptions for real-time data
- **Memory Management**: Proper cleanup of subscriptions and temporary data

## Error Handling

The system gracefully handles:
- **Missing Students**: Returns empty arrays if student not found
- **No Opponents**: Returns null/empty arrays when no eligible opponents exist
- **Invalid Parameters**: Validates input parameters
- **Network Errors**: Proper error handling for data fetching

## Future Enhancements

Potential improvements for future versions:
- **Weighted Scoring**: Consider match history quality in recommendations
- **Tournament Brackets**: Support for bracket-style pairings
- **Seasonal Resets**: Support for tournament seasons
- **Advanced Filtering**: Filter by win rate, recent performance, etc.
- **Bulk Operations**: Optimize for generating multiple pairings at once
- **Machine Learning**: Use historical data to improve recommendations

## Testing

The system includes comprehensive test coverage for:
- Score margin filtering
- Match history validation
- Best-of-3 scenarios
- Edge cases (no students, single student, etc.)
- Performance with large datasets

## Browser Compatibility

- **Modern Browsers**: Full support for ES6+ async/await
- **Mobile Support**: Responsive design for all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation 
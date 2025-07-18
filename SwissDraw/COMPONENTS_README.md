# SwissDraw UI Components

This document describes the new UI components created for displaying leaderboards and match history in the SwissDraw tournament management system.

## Components Overview

### 1. StudentLeaderboard Component
**File:** `src/lib/components/StudentLeaderboard.svelte`

A comprehensive leaderboard component that displays students ranked by their scores with additional statistics.

#### Features:
- **Ranking Display**: Students sorted by score (descending)
- **Medal System**: Gold (🥇), Silver (🥈), Bronze (🥉) medals for top 3
- **Statistics**: Shows score, total matches, wins/losses, and win rate
- **Visual Indicators**: 
  - Special styling for top 3 students with gradient backgrounds
  - Win rate progress bars
  - Color-coded winners/losers
- **Responsive Design**: Mobile-friendly layout
- **Auto-updates**: Reactively updates when scores or matches change

#### Usage:
```svelte
<script>
  import StudentLeaderboard from '$lib/components/StudentLeaderboard.svelte';
</script>

<StudentLeaderboard />
```

### 2. MatchHistory Component
**File:** `src/lib/components/MatchHistory.svelte`

A detailed match history component with filtering and sorting capabilities.

#### Features:
- **Complete Match Table**: Shows all matches with dates, players, and results
- **Student Filtering**: Dropdown to filter matches by specific student
- **Date Sorting**: Toggle between newest and oldest first
- **Visual Indicators**: Color-coded winners and losers
- **Responsive Table**: Horizontal scroll on mobile devices
- **Real-time Updates**: Automatically updates when new matches are recorded

#### Usage:
```svelte
<script>
  import MatchHistory from '$lib/components/MatchHistory.svelte';
</script>

<MatchHistory />
```

## Utility Functions

### Leaderboard Utilities
**File:** `src/lib/leaderboard.ts`

#### Main Functions:

1. **`getLeaderboard(students, matches)`**
   - Returns students sorted by score with win/loss statistics
   - Primary sort: score (descending)
   - Secondary sort: win rate (descending)
   - Tertiary sort: total matches (descending)
   - Final sort: name (ascending)

2. **`calculateStudentStats(studentId, matches)`**
   - Calculates win/loss statistics for a specific student
   - Returns: `{ wins, losses, totalMatches, winRate }`

3. **`getTopStudents(students, matches, limit)`**
   - Returns top N students from leaderboard
   - Default limit: 10

4. **`getStudentRank(studentId, students, matches)`**
   - Returns 1-based rank of a student
   - Returns -1 if student not found

#### Helper Functions:

- **`formatWinRate(winRate)`**: Formats win rate as percentage string
- **`getMedalEmoji(rank)`**: Returns medal emoji for rank position

#### Usage:
```typescript
import { 
  getLeaderboard, 
  calculateStudentStats, 
  getTopStudents,
  formatWinRate 
} from '$lib/leaderboard';

// Get full leaderboard
const leaderboard = getLeaderboard(students, matches);

// Get student statistics
const stats = calculateStudentStats(studentId, matches);

// Get top 5 students
const top5 = getTopStudents(students, matches, 5);

// Format win rate
const winRateStr = formatWinRate(75.5); // "75.5%"
```

## Data Integration

Both components integrate seamlessly with the existing data stores:

- **Students Store**: Uses `getStudents()` function to fetch student data
- **Match History Store**: Subscribes to `$matchHistory` for real-time updates
- **Reactive Updates**: Components automatically re-render when data changes

## Styling

Components follow the existing design system:
- **Color Scheme**: Consistent with existing pages (#2c3e50, #7f8c8d, #3498db, etc.)
- **Typography**: Apple system fonts
- **Spacing**: Consistent padding and margins
- **Responsive**: Mobile-first design with breakpoints at 768px
- **Animations**: Smooth transitions and hover effects

## Routes

New routes have been created to showcase the components:

- **`/Leaderboard`**: Displays the StudentLeaderboard component
- **`/History`**: Displays the MatchHistory component
- **`/`**: Updated main page with navigation to all features

## Performance Considerations

- **Efficient Sorting**: Leaderboard calculations are optimized
- **Reactive Updates**: Only re-calculates when data actually changes
- **Lazy Loading**: Components load data on mount
- **Memory Management**: Proper cleanup of subscriptions

## Browser Compatibility

- **Modern Browsers**: Full support for ES6+ features
- **Mobile Support**: Responsive design for all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Future Enhancements

Potential improvements for future versions:
- Export leaderboard to PDF/CSV
- Advanced filtering options (date ranges, score ranges)
- Tournament brackets visualization
- Player head-to-head statistics
- Season/tournament grouping
- Real-time notifications for new matches 
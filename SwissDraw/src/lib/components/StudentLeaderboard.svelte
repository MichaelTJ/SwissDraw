<script lang="ts">
	import { onMount } from 'svelte';
	import { getStudents, type Student } from '$lib/students';
	import { matchHistory, type Match } from '$lib/matches';
	import { 
		getLeaderboard, 
		getMedalEmoji, 
		formatWinRate, 
		type LeaderboardEntry 
	} from '$lib/leaderboard';

	let students: Student[] = [];
	let leaderboard: LeaderboardEntry[] = [];
	let loading = true;

	// Load students and calculate leaderboard
	async function loadData() {
		loading = true;
		students = await getStudents();
		updateLeaderboard();
		loading = false;
	}

	// Update leaderboard when data changes
	function updateLeaderboard() {
		let currentMatches: Match[] = [];
		const unsubscribe = matchHistory.subscribe(matches => {
			currentMatches = matches;
		});
		unsubscribe();
		
		leaderboard = getLeaderboard(students, currentMatches);
	}

	// Subscribe to match history changes
	$: if ($matchHistory && students.length > 0) {
		updateLeaderboard();
	}

	onMount(() => {
		loadData();
	});
</script>

<svelte:head>
	<title>Leaderboard - SwissDraw</title>
</svelte:head>

<div class="leaderboard-container">
	<header>
		<h1>Student Leaderboard</h1>
		<p>Rankings based on scores and match performance</p>
	</header>

	{#if loading}
		<div class="loading-state">
			<p>Loading leaderboard...</p>
		</div>
	{:else if leaderboard.length === 0}
		<div class="empty-state">
			<p>No students found. Add some students to see the leaderboard!</p>
		</div>
	{:else}
		<div class="leaderboard-section">
			<div class="leaderboard-header">
				<h2>Rankings ({leaderboard.length} students)</h2>
			</div>
			
			<div class="leaderboard-list">
				{#each leaderboard as entry, index (entry.student.id)}
					{@const rank = index + 1}
					{@const medal = getMedalEmoji(rank)}
					{@const isTopThree = rank <= 3}
					
					<div class="leaderboard-entry {isTopThree ? 'top-three' : ''}">
						<div class="rank-section">
							<span class="rank-number">{rank}</span>
							{#if medal}
								<span class="medal">{medal}</span>
							{/if}
						</div>
						
						<div class="student-info">
							<div class="student-name-section">
								<span class="student-name {isTopThree ? 'top-name' : ''}">
									{entry.student.name}
								</span>
								{#if isTopThree}
									<span class="top-badge">#{rank}</span>
								{/if}
							</div>
							<div class="student-stats">
								<span class="score">Score: {entry.student.score}</span>
								<span class="matches">Matches: {entry.totalMatches}</span>
								<span class="record">Record: {entry.wins}W - {entry.losses}L</span>
								<span class="win-rate">Win Rate: {formatWinRate(entry.winRate)}</span>
							</div>
						</div>
						
						<div class="performance-indicator">
							{#if entry.totalMatches > 0}
								<div class="win-rate-bar">
									<div 
										class="win-rate-fill" 
										style="width: {entry.winRate}%"
									></div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.leaderboard-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		color: #2c3e50;
		margin-bottom: 0.5rem;
		font-size: 2.5rem;
		font-weight: 700;
	}

	header p {
		color: #7f8c8d;
		font-size: 1.1rem;
		margin: 0;
	}

	.loading-state,
	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
		color: #7f8c8d;
		font-size: 1.1rem;
	}

	.leaderboard-section {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.leaderboard-header {
		padding: 1.5rem 2rem;
		background: #f8f9fa;
		border-bottom: 1px solid #e9ecef;
	}

	.leaderboard-header h2 {
		margin: 0;
		color: #2c3e50;
		font-size: 1.5rem;
	}

	.leaderboard-list {
		padding: 0;
	}

	.leaderboard-entry {
		display: flex;
		align-items: center;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid #e9ecef;
		transition: all 0.2s ease;
	}

	.leaderboard-entry:hover {
		background: #f8f9fa;
	}

	.leaderboard-entry:last-child {
		border-bottom: none;
	}

	.leaderboard-entry.top-three {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.leaderboard-entry.top-three:hover {
		background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
	}

	.rank-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 80px;
	}

	.rank-number {
		font-size: 1.5rem;
		font-weight: 700;
		color: #2c3e50;
	}

	.top-three .rank-number {
		color: white;
	}

	.medal {
		font-size: 1.5rem;
	}

	.student-info {
		flex: 1;
		margin-left: 1rem;
	}

	.student-name-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.student-name {
		font-size: 1.2rem;
		font-weight: 600;
		color: #2c3e50;
	}

	.top-name {
		font-size: 1.3rem;
		font-weight: 700;
		color: white;
	}

	.top-badge {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.student-stats {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.student-stats span {
		font-size: 0.9rem;
		color: #7f8c8d;
	}

	.top-three .student-stats span {
		color: rgba(255, 255, 255, 0.8);
	}

	.score {
		font-weight: 600;
		color: #27ae60 !important;
	}

	.top-three .score {
		color: #2ecc71 !important;
	}

	.performance-indicator {
		margin-left: 1rem;
		min-width: 100px;
	}

	.win-rate-bar {
		width: 100px;
		height: 8px;
		background: #e9ecef;
		border-radius: 4px;
		overflow: hidden;
	}

	.top-three .win-rate-bar {
		background: rgba(255, 255, 255, 0.3);
	}

	.win-rate-fill {
		height: 100%;
		background: linear-gradient(90deg, #27ae60, #2ecc71);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.top-three .win-rate-fill {
		background: linear-gradient(90deg, #f1c40f, #f39c12);
	}

	@media (max-width: 768px) {
		.leaderboard-container {
			padding: 1rem;
		}

		.leaderboard-entry {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.rank-section {
			min-width: auto;
			justify-content: center;
		}

		.student-info {
			margin-left: 0;
			text-align: center;
		}

		.student-stats {
			justify-content: center;
		}

		.performance-indicator {
			margin-left: 0;
			align-self: center;
		}
	}
</style> 
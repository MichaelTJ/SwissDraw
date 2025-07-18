<script lang="ts">
	import { onMount } from 'svelte';
	import { getStudents, type Student } from '$lib/students';
	import { recordMatch } from '$lib/matches';
	import { 
		getMatchRecommendations, 
		getMatchRecommendationStats,
		hasPossibleMatchRecommendations,
		type MatchRecommendation 
	} from '$lib/matchRecommendations';

	let students: Student[] = [];
	let recommendations: MatchRecommendation[] = [];
	let stats: any = null;
	let margin = 1;
	let loading = false;
	let refreshing = false;
	let message = '';
	let messageType: 'success' | 'error' | 'info' = 'info';

	// Load students and generate initial recommendations
	onMount(async () => {
		loading = true;
		students = await getStudents();
		await generateRecommendations();
		loading = false;
	});

	// Generate new match recommendations
	async function generateRecommendations() {
		if (students.length < 2) {
			recommendations = [];
			stats = null;
			return;
		}

		refreshing = true;
		message = '';
		
		try {
			recommendations = await getMatchRecommendations(students, margin);
			stats = await getMatchRecommendationStats(students, margin);
			
			if (recommendations.length === 0) {
				const hasPossible = await hasPossibleMatchRecommendations(students, margin);
				if (!hasPossible) {
					message = 'No valid matchups available with current criteria. Try increasing the score margin.';
					messageType = 'info';
				} else {
					message = 'No match recommendations found. All students may already be paired.';
					messageType = 'info';
				}
			} else {
				message = `Generated ${recommendations.length} match recommendations!`;
				messageType = 'success';
			}
		} catch (error) {
			console.error('Error generating recommendations:', error);
			message = 'Error generating recommendations. Please try again.';
			messageType = 'error';
		} finally {
			refreshing = false;
		}
	}

	// Record a match result
	async function recordMatchResult(recommendation: MatchRecommendation, winnerId: string) {
		const loserId = winnerId === recommendation.playerA.id 
			? recommendation.playerB.id 
			: recommendation.playerA.id;

		loading = true;
		message = '';

		try {
			const success = await recordMatch(winnerId, loserId);
			if (success) {
				message = 'Match recorded successfully!';
				messageType = 'success';
				
				// Remove the recorded match from recommendations
				recommendations = recommendations.filter(r => 
					!(r.playerA.id === recommendation.playerA.id && r.playerB.id === recommendation.playerB.id)
				);
				
				// Update stats
				stats = await getMatchRecommendationStats(students, margin);
				
				// Reload students to get updated scores
				students = await getStudents();
			} else {
				message = 'Failed to record match. Please try again.';
				messageType = 'error';
			}
		} catch (error) {
			console.error('Error recording match:', error);
			message = 'Error recording match. Please try again.';
			messageType = 'error';
		} finally {
			loading = false;
		}
	}

	// Handle margin change
	$: if (margin && students.length > 0) {
		generateRecommendations();
	}
</script>

<svelte:head>
	<title>Match Recommendations - SwissDraw</title>
</svelte:head>

<div class="match-recommendations-container">
	<header>
		<h1>Match Recommendations</h1>
		<p>AI-powered match pairings for fair and balanced tournaments</p>
	</header>

	<div class="controls-section">
		<div class="control-group">
			<label for="margin-input">Score Margin:</label>
			<input
				id="margin-input"
				type="number"
				bind:value={margin}
				min="0"
				max="10"
				class="margin-input"
				disabled={loading}
			/>
			<span class="help-text">Maximum score difference between opponents</span>
		</div>

		<button 
			class="refresh-btn"
			on:click={generateRecommendations}
			disabled={loading || refreshing}
		>
			{refreshing ? 'Generating...' : '🔄 Refresh Recommendations'}
		</button>
	</div>

	{#if message}
		<div class="message {messageType}">
			{message}
		</div>
	{/if}

	{#if loading && recommendations.length === 0}
		<div class="loading-state">
			<p>Loading match recommendations...</p>
		</div>
	{:else if students.length < 2}
		<div class="empty-state">
			<p>Need at least 2 students to generate match recommendations.</p>
		</div>
	{:else}
		<!-- Statistics -->
		{#if stats}
			<div class="stats-card">
				<h3>📊 Recommendation Statistics</h3>
				<div class="stats-grid">
					<div class="stat-item">
						<span class="stat-label">Total Students:</span>
						<span class="stat-value">{stats.totalStudents}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Students with Opponents:</span>
						<span class="stat-value">{stats.studentsWithOpponents}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Possible Matches:</span>
						<span class="stat-value">{stats.possibleMatches}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Avg Score Difference:</span>
						<span class="stat-value">{stats.averageScoreDifference.toFixed(1)}</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Match Recommendations -->
		<div class="recommendations-section">
			<div class="section-header">
				<h2>Recommended Matches ({recommendations.length})</h2>
				{#if recommendations.length > 0}
					<span class="subtitle">Click on a player to record them as the winner</span>
				{/if}
			</div>

			{#if recommendations.length === 0}
				<div class="empty-state">
					<p>No match recommendations available.</p>
					<button 
						class="try-again-btn"
						on:click={generateRecommendations}
						disabled={loading}
					>
						Try Again
					</button>
				</div>
			{:else}
				<div class="recommendations-grid">
					{#each recommendations as recommendation (recommendation.playerA.id + '-' + recommendation.playerB.id)}
						<div class="match-card">
							<div class="match-header">
								<span class="match-number">Match #{recommendations.indexOf(recommendation) + 1}</span>
								<span class="score-difference">Score Diff: {recommendation.scoreDifference}</span>
							</div>
							
							<div class="players-section">
								<button
									class="player-card player-a"
									on:click={() => recordMatchResult(recommendation, recommendation.playerA.id)}
									disabled={loading}
								>
									<div class="player-info">
										<span class="player-name">{recommendation.playerA.name}</span>
										<span class="player-score">Score: {recommendation.playerA.score}</span>
									</div>
									<div class="winner-indicator">👑</div>
								</button>
								
								<div class="vs-divider">
									<span class="vs-text">VS</span>
								</div>
								
								<button
									class="player-card player-b"
									on:click={() => recordMatchResult(recommendation, recommendation.playerB.id)}
									disabled={loading}
								>
									<div class="player-info">
										<span class="player-name">{recommendation.playerB.name}</span>
										<span class="player-score">Score: {recommendation.playerB.score}</span>
									</div>
									<div class="winner-indicator">👑</div>
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.match-recommendations-container {
		max-width: 1200px;
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

	.controls-section {
		background: #f8f9fa;
		padding: 1.5rem 2rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		color: #2c3e50;
		font-size: 0.9rem;
	}

	.margin-input {
		padding: 0.5rem 0.75rem;
		border: 2px solid #e9ecef;
		border-radius: 6px;
		font-size: 0.9rem;
		background: white;
		width: 100px;
	}

	.margin-input:focus {
		outline: none;
		border-color: #3498db;
	}

	.help-text {
		font-size: 0.8rem;
		color: #7f8c8d;
	}

	.refresh-btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		background: #3498db;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.refresh-btn:hover:not(:disabled) {
		background: #2980b9;
		transform: translateY(-1px);
	}

	.refresh-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.message {
		padding: 1rem 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		font-weight: 600;
	}

	.message.success {
		background: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.message.error {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	.message.info {
		background: #d1ecf1;
		color: #0c5460;
		border: 1px solid #bee5eb;
	}

	.loading-state,
	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
		color: #7f8c8d;
		font-size: 1.1rem;
	}

	.stats-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		padding: 1.5rem 2rem;
		margin-bottom: 2rem;
	}

	.stats-card h3 {
		margin: 0 0 1rem 0;
		color: #2c3e50;
		font-size: 1.3rem;
		font-weight: 600;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
	}

	.stat-label {
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	.stat-value {
		font-weight: 600;
		color: #2c3e50;
	}

	.recommendations-section {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.section-header {
		padding: 1.5rem 2rem;
		background: #f8f9fa;
		border-bottom: 1px solid #e9ecef;
	}

	.section-header h2 {
		margin: 0 0 0.5rem 0;
		color: #2c3e50;
		font-size: 1.5rem;
	}

	.subtitle {
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	.recommendations-grid {
		padding: 2rem;
		display: grid;
		gap: 1.5rem;
	}

	.match-card {
		border: 2px solid #e9ecef;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.2s;
	}

	.match-card:hover {
		border-color: #3498db;
		box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
	}

	.match-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.match-number {
		font-weight: 600;
		color: #2c3e50;
		font-size: 1.1rem;
	}

	.score-difference {
		background: #e8f5e8;
		color: #27ae60;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.players-section {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.player-card {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.player-card:hover:not(:disabled) {
		border-color: #3498db;
		background: #f8f9fa;
		transform: translateY(-2px);
	}

	.player-card:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.player-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.player-name {
		font-weight: 600;
		color: #2c3e50;
		font-size: 1.1rem;
	}

	.player-score {
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	.winner-indicator {
		font-size: 1.5rem;
		opacity: 0.3;
		transition: opacity 0.2s;
	}

	.player-card:hover .winner-indicator {
		opacity: 1;
	}

	.vs-divider {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 60px;
	}

	.vs-text {
		background: #f8f9fa;
		color: #7f8c8d;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.try-again-btn {
		margin-top: 1rem;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		background: #3498db;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.try-again-btn:hover:not(:disabled) {
		background: #2980b9;
		transform: translateY(-1px);
	}

	@media (max-width: 768px) {
		.match-recommendations-container {
			padding: 1rem;
		}

		.controls-section {
			flex-direction: column;
			align-items: stretch;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.players-section {
			flex-direction: column;
			gap: 0.75rem;
		}

		.vs-divider {
			min-width: auto;
		}

		.match-header {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}
	}
</style> 
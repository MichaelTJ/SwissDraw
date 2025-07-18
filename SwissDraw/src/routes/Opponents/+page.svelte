<script lang="ts">
	import { onMount } from 'svelte';
	import { getStudents, type Student } from '$lib/students';
	import { 
		getEligibleOpponents, 
		getBestOpponentRecommendation,
		getOpponentRecommendations,
		getOpponentAvailabilityStats,
		type MatchResult 
	} from '$lib/opponents';

	let students: Student[] = [];
	let selectedStudent = '';
	let margin = 1;
	let eligibleOpponents: Student[] = [];
	let bestOpponent: Student | null = null;
	let recommendations: Student[] = [];
	let stats: any = null;
	let loading = false;

	onMount(async () => {
		students = await getStudents();
		if (students.length > 0) {
			selectedStudent = students[0].id;
			await updateRecommendations();
		}
	});

	async function updateRecommendations() {
		if (!selectedStudent) return;
		
		loading = true;
		try {
			eligibleOpponents = await getEligibleOpponents(selectedStudent, margin);
			bestOpponent = await getBestOpponentRecommendation(selectedStudent, margin);
			recommendations = await getOpponentRecommendations(selectedStudent, margin, 5);
			stats = await getOpponentAvailabilityStats(selectedStudent, margin);
		} catch (error) {
			console.error('Error updating recommendations:', error);
		} finally {
			loading = false;
		}
	}

	$: if (selectedStudent && margin) {
		updateRecommendations();
	}
</script>

<svelte:head>
	<title>Opponent Recommendations - SwissDraw</title>
</svelte:head>

<div class="opponents-container">
	<header>
		<h1>Opponent Recommendations</h1>
		<p>Find suitable opponents based on similar scores and match history</p>
	</header>

	<div class="controls-section">
		<div class="control-group">
			<label for="student-select">Select Student:</label>
			<select 
				id="student-select"
				bind:value={selectedStudent}
				class="student-select"
			>
				{#each students as student}
					<option value={student.id}>
						{student.name} (Score: {student.score})
					</option>
				{/each}
			</select>
		</div>

		<div class="control-group">
			<label for="margin-input">Score Margin:</label>
			<input
				id="margin-input"
				type="number"
				bind:value={margin}
				min="0"
				max="10"
				class="margin-input"
			/>
		</div>
	</div>

	{#if loading}
		<div class="loading-state">
			<p>Loading recommendations...</p>
		</div>
	{:else if selectedStudent}
		<div class="recommendations-section">
			<!-- Statistics -->
			{#if stats}
				<div class="stats-card">
					<h3>Opponent Availability</h3>
					<div class="stats-grid">
						<div class="stat-item">
							<span class="stat-label">Total Students:</span>
							<span class="stat-value">{stats.totalStudents}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Eligible Opponents:</span>
							<span class="stat-value eligible">{stats.eligibleOpponents}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Within Score Margin:</span>
							<span class="stat-value">{stats.withinMargin}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Excluded by Match Limit:</span>
							<span class="stat-value excluded">{stats.excludedByMatchLimit}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Excluded by Score:</span>
							<span class="stat-value excluded">{stats.excludedByScore}</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Best Opponent -->
			{#if bestOpponent}
				<div class="best-opponent-card">
					<h3>🏆 Best Opponent Recommendation</h3>
					<div class="opponent-info">
						<span class="opponent-name">{bestOpponent.name}</span>
						<span class="opponent-score">Score: {bestOpponent.score}</span>
					</div>
				</div>
			{:else}
				<div class="no-opponents-card">
					<h3>No Eligible Opponents</h3>
					<p>No suitable opponents found with the current criteria.</p>
				</div>
			{/if}

			<!-- All Eligible Opponents -->
			<div class="eligible-opponents-card">
				<h3>All Eligible Opponents ({eligibleOpponents.length})</h3>
				{#if eligibleOpponents.length === 0}
					<p class="empty-state">No eligible opponents found.</p>
				{:else}
					<div class="opponents-list">
						{#each eligibleOpponents as opponent (opponent.id)}
							<div class="opponent-item">
								<div class="opponent-details">
									<span class="opponent-name">{opponent.name}</span>
									<span class="opponent-score">Score: {opponent.score}</span>
								</div>
								<div class="score-difference">
									Score Diff: {Math.abs(students.find(s => s.id === selectedStudent)?.score || 0 - opponent.score)}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Top Recommendations -->
			{#if recommendations.length > 0}
				<div class="recommendations-card">
					<h3>Top 5 Recommendations</h3>
					<div class="recommendations-list">
						{#each recommendations as opponent, index (opponent.id)}
							<div class="recommendation-item">
								<span class="rank">#{index + 1}</span>
								<div class="opponent-details">
									<span class="opponent-name">{opponent.name}</span>
									<span class="opponent-score">Score: {opponent.score}</span>
								</div>
								<div class="score-difference">
									Score Diff: {Math.abs(students.find(s => s.id === selectedStudent)?.score || 0 - opponent.score)}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="empty-state">
			<p>No students available. Add some students first!</p>
		</div>
	{/if}
</div>

<style>
	.opponents-container {
		max-width: 1000px;
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
		gap: 2rem;
		align-items: center;
		flex-wrap: wrap;
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

	.student-select,
	.margin-input {
		padding: 0.5rem 0.75rem;
		border: 2px solid #e9ecef;
		border-radius: 6px;
		font-size: 0.9rem;
		background: white;
		min-width: 200px;
	}

	.student-select:focus,
	.margin-input:focus {
		outline: none;
		border-color: #3498db;
	}

	.loading-state,
	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
		color: #7f8c8d;
		font-size: 1.1rem;
	}

	.recommendations-section {
		display: grid;
		gap: 2rem;
	}

	.stats-card,
	.best-opponent-card,
	.no-opponents-card,
	.eligible-opponents-card,
	.recommendations-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		padding: 1.5rem 2rem;
	}

	.stats-card h3,
	.best-opponent-card h3,
	.no-opponents-card h3,
	.eligible-opponents-card h3,
	.recommendations-card h3 {
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

	.stat-value.eligible {
		color: #27ae60;
	}

	.stat-value.excluded {
		color: #e74c3c;
	}

	.best-opponent-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.best-opponent-card h3 {
		color: white;
	}

	.opponent-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.opponent-name {
		font-size: 1.2rem;
		font-weight: 600;
	}

	.opponent-score {
		font-size: 1rem;
		opacity: 0.9;
	}

	.opponents-list,
	.recommendations-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.opponent-item,
	.recommendation-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
		border-left: 4px solid #3498db;
	}

	.recommendation-item {
		border-left-color: #27ae60;
	}

	.rank {
		background: #3498db;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 600;
		min-width: 30px;
		text-align: center;
	}

	.opponent-details {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.score-difference {
		color: #7f8c8d;
		font-size: 0.85rem;
	}

	@media (max-width: 768px) {
		.opponents-container {
			padding: 1rem;
		}

		.controls-section {
			flex-direction: column;
			align-items: stretch;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.opponent-item,
		.recommendation-item {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}
	}
</style> 
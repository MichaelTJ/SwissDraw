<script lang="ts">
	import { onMount } from 'svelte';
	import { getStudents, type Student } from '$lib/students';
	import { 
		matchHistory, 
		recordMatch, 
		canPlay, 
		getMatchHistory, 
		getMatchesBetweenStudents,
		getStudentMatchStats,
		type Match 
	} from '$lib/matches';

	let students: Student[] = [];
	let selectedPlayerA = '';
	let selectedPlayerB = '';
	let selectedWinner = '';
	let loading = false;
	let message = '';

	// Load students on mount
	onMount(async () => {
		students = await getStudents();
	});

	// Reset form after recording a match
	function resetForm() {
		selectedPlayerA = '';
		selectedPlayerB = '';
		selectedWinner = '';
	}

	// Record a match
	async function handleRecordMatch() {
		if (!selectedPlayerA || !selectedPlayerB || !selectedWinner) {
			message = 'Please select both players and a winner';
			return;
		}

		if (selectedPlayerA === selectedPlayerB) {
			message = 'Players cannot play against themselves';
			return;
		}

		// Check if players can play
		if (!canPlay(selectedPlayerA, selectedPlayerB)) {
			message = 'These players cannot play another match (limit reached)';
			return;
		}

		// Determine winner and loser
		const winnerId = selectedWinner;
		const loserId = selectedWinner === selectedPlayerA ? selectedPlayerB : selectedPlayerA;

		loading = true;
		message = '';

		try {
			const success = await recordMatch(winnerId, loserId);
			if (success) {
				message = 'Match recorded successfully!';
				resetForm();
				// Reload students to get updated scores
				students = await getStudents();
			} else {
				message = 'Failed to record match';
			}
		} catch (error) {
			message = 'Error recording match';
			console.error(error);
		} finally {
			loading = false;
		}
	}

	// Get student name by ID
	function getStudentName(id: string): string {
		const student = students.find(s => s.id === id);
		return student ? student.name : 'Unknown';
	}

	// Get matches between selected players
	$: matchesBetweenSelected = selectedPlayerA && selectedPlayerB 
		? getMatchesBetweenStudents(selectedPlayerA, selectedPlayerB)
		: [];

	// Check if selected players can play
	$: canSelectedPlayersPlay = selectedPlayerA && selectedPlayerB 
		? canPlay(selectedPlayerA, selectedPlayerB)
		: true;
</script>

<svelte:head>
	<title>Match Recording - SwissDraw</title>
</svelte:head>

<div class="container">
	<header>
		<h1>Match Recording</h1>
		<p>Record match results and manage student scores</p>
	</header>

	{#if message}
		<div class="message {message.includes('successfully') ? 'success' : 'error'}">
			{message}
		</div>
	{/if}

	<!-- Match Recording Form -->
	<div class="match-form">
		<h2>Record New Match</h2>
		
		<div class="form-grid">
			<div class="form-group">
				<label for="playerA">Player A:</label>
				<select 
					id="playerA" 
					bind:value={selectedPlayerA}
					disabled={loading}
				>
					<option value="">Select Player A</option>
					{#each students as student}
						<option value={student.id}>{student.name} (Score: {student.score})</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="playerB">Player B:</label>
				<select 
					id="playerB" 
					bind:value={selectedPlayerB}
					disabled={loading}
				>
					<option value="">Select Player B</option>
					{#each students as student}
						<option value={student.id}>{student.name} (Score: {student.score})</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="winner">Winner:</label>
				<select 
					id="winner" 
					bind:value={selectedWinner}
					disabled={loading || !selectedPlayerA || !selectedPlayerB}
				>
					<option value="">Select Winner</option>
					{#if selectedPlayerA}
						<option value={selectedPlayerA}>{getStudentName(selectedPlayerA)}</option>
					{/if}
					{#if selectedPlayerB}
						<option value={selectedPlayerB}>{getStudentName(selectedPlayerB)}</option>
					{/if}
				</select>
			</div>
		</div>

		<div class="form-actions">
			<button 
				on:click={handleRecordMatch} 
				disabled={loading || !selectedPlayerA || !selectedPlayerB || !selectedWinner}
				class="record-btn"
			>
				{loading ? 'Recording...' : 'Record Match'}
			</button>
		</div>

		{#if selectedPlayerA && selectedPlayerB}
			<div class="match-info">
				<h3>Match Information</h3>
				<div class="info-grid">
					<div class="info-item">
						<strong>Can Play:</strong> 
						<span class="{canSelectedPlayersPlay ? 'yes' : 'no'}">
							{canSelectedPlayersPlay ? 'Yes' : 'No'}
						</span>
					</div>
					<div class="info-item">
						<strong>Previous Matches:</strong> {matchesBetweenSelected.length}
					</div>
					{#if matchesBetweenSelected.length > 0}
						<div class="info-item">
							<strong>Last Match:</strong> 
							{new Date(matchesBetweenSelected[matchesBetweenSelected.length - 1].date).toLocaleDateString()}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Match History -->
	<div class="match-history">
		<h2>Recent Matches</h2>
		{#if $matchHistory.length === 0}
			<p class="empty-state">No matches recorded yet.</p>
		{:else}
			<div class="matches-list">
				{#each $matchHistory.slice(-10).reverse() as match (match.id)}
					<div class="match-card">
						<div class="match-players">
							<span class="player {match.winner === match.playerA ? 'winner' : 'loser'}">
								{getStudentName(match.playerA)}
							</span>
							<span class="vs">vs</span>
							<span class="player {match.winner === match.playerB ? 'winner' : 'loser'}">
								{getStudentName(match.playerB)}
							</span>
						</div>
						<div class="match-details">
							<span class="winner-label">Winner: {getStudentName(match.winner)}</span>
							<span class="match-date">{new Date(match.date).toLocaleDateString()}</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Student Statistics -->
	<div class="student-stats">
		<h2>Student Statistics</h2>
		<div class="stats-grid">
			{#each students as student}
				{@const stats = getStudentMatchStats(student.id)}
				<div class="student-stat-card">
					<h3>{student.name}</h3>
					<div class="stat-details">
						<div class="stat-item">
							<strong>Score:</strong> {student.score}
						</div>
						<div class="stat-item">
							<strong>Wins:</strong> {stats.wins}
						</div>
						<div class="stat-item">
							<strong>Losses:</strong> {stats.losses}
						</div>
						<div class="stat-item">
							<strong>Total Matches:</strong> {stats.total}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.container {
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

	.message {
		padding: 1rem;
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

	.match-form {
		background: #f8f9fa;
		padding: 2rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.match-form h2 {
		margin: 0 0 1.5rem 0;
		color: #2c3e50;
		font-size: 1.5rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-weight: 600;
		color: #2c3e50;
	}

	select {
		padding: 0.75rem 1rem;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		font-size: 1rem;
		background: white;
		transition: border-color 0.2s;
	}

	select:focus {
		outline: none;
		border-color: #3498db;
	}

	select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-actions {
		text-align: center;
	}

	.record-btn {
		background: #27ae60;
		color: white;
		padding: 1rem 2rem;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.record-btn:hover:not(:disabled) {
		background: #229954;
		transform: translateY(-1px);
	}

	.record-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.match-info {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		margin-top: 1.5rem;
		border: 1px solid #e9ecef;
	}

	.match-info h3 {
		margin: 0 0 1rem 0;
		color: #2c3e50;
		font-size: 1.2rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #f1f3f4;
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.yes {
		color: #27ae60;
		font-weight: 600;
	}

	.no {
		color: #e74c3c;
		font-weight: 600;
	}

	.match-history, .student-stats {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.match-history h2, .student-stats h2 {
		margin: 0 0 1.5rem 0;
		color: #2c3e50;
		font-size: 1.5rem;
	}

	.empty-state {
		text-align: center;
		color: #7f8c8d;
		font-style: italic;
	}

	.matches-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.match-card {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 8px;
		border-left: 4px solid #3498db;
	}

	.match-players {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.player {
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.player.winner {
		background: #d4edda;
		color: #155724;
	}

	.player.loser {
		background: #f8d7da;
		color: #721c24;
	}

	.vs {
		color: #7f8c8d;
		font-weight: normal;
	}

	.match-details {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.9rem;
		color: #6c757d;
	}

	.winner-label {
		font-weight: 600;
		color: #2c3e50;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.student-stat-card {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e9ecef;
	}

	.student-stat-card h3 {
		margin: 0 0 1rem 0;
		color: #2c3e50;
		font-size: 1.2rem;
		border-bottom: 2px solid #3498db;
		padding-bottom: 0.5rem;
	}

	.stat-details {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e9ecef;
	}

	.stat-item:last-child {
		border-bottom: none;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.match-players {
			flex-direction: column;
			gap: 0.5rem;
		}

		.match-details {
			flex-direction: column;
			gap: 0.5rem;
			align-items: flex-start;
		}
	}
</style> 
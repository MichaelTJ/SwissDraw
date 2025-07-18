<script lang="ts">
	import { onMount } from 'svelte';
	import { getStudents, type Student } from '$lib/students';
	import { matchHistory, type Match } from '$lib/matches';

	let students: Student[] = [];
	let filteredMatches: Match[] = [];
	let selectedStudentFilter = '';
	let sortOrder: 'newest' | 'oldest' = 'newest';
	let loading = true;

	// Load students on mount
	onMount(async () => {
		loading = true;
		students = await getStudents();
		loading = false;
	});

	// Filter and sort matches
	$: {
		let matches = $matchHistory;
		
		// Apply student filter
		if (selectedStudentFilter) {
			matches = matches.filter(match => 
				match.playerA === selectedStudentFilter || 
				match.playerB === selectedStudentFilter
			);
		}
		
		// Sort by date
		matches = [...matches].sort((a, b) => {
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();
			return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
		});
		
		filteredMatches = matches;
	}

	// Get student name by ID
	function getStudentName(id: string): string {
		const student = students.find(s => s.id === id);
		return student ? student.name : 'Unknown';
	}

	// Format date
	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Clear filter
	function clearFilter() {
		selectedStudentFilter = '';
	}

	// Toggle sort order
	function toggleSortOrder() {
		sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
	}
</script>

<svelte:head>
	<title>Match History - SwissDraw</title>
</svelte:head>

<div class="match-history-container">
	<header>
		<h1>Match History</h1>
		<p>Complete record of all matches played</p>
	</header>

	{#if loading}
		<div class="loading-state">
			<p>Loading match history...</p>
		</div>
	{:else}
		<div class="controls-section">
			<div class="filter-controls">
				<label for="student-filter">Filter by Student:</label>
				<select 
					id="student-filter"
					bind:value={selectedStudentFilter}
					class="student-select"
				>
					<option value="">All Students</option>
					{#each students as student}
						<option value={student.id}>{student.name}</option>
					{/each}
				</select>
				
				{#if selectedStudentFilter}
					<button class="clear-filter-btn" on:click={clearFilter}>
						Clear Filter
					</button>
				{/if}
			</div>
			
			<div class="sort-controls">
				<label>Sort by Date:</label>
				<button 
					class="sort-btn {sortOrder === 'newest' ? 'active' : ''}"
					on:click={toggleSortOrder}
				>
					{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
				</button>
			</div>
		</div>

		<div class="match-history-section">
			<div class="section-header">
				<h2>Matches ({filteredMatches.length})</h2>
				{#if selectedStudentFilter}
					<span class="filter-indicator">
						Showing matches for: {getStudentName(selectedStudentFilter)}
					</span>
				{/if}
			</div>

			{#if filteredMatches.length === 0}
				<div class="empty-state">
					{#if selectedStudentFilter}
						<p>No matches found for {getStudentName(selectedStudentFilter)}</p>
					{:else}
						<p>No matches recorded yet. Record your first match to see the history!</p>
					{/if}
				</div>
			{:else}
				<div class="matches-table-container">
					<table class="matches-table">
						<thead>
							<tr>
								<th>Date</th>
								<th>Player A</th>
								<th>Player B</th>
								<th>Winner</th>
								<th>Result</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredMatches as match (match.id)}
								<tr class="match-row">
									<td class="match-date">
										{formatDate(match.date)}
									</td>
									<td class="player-cell {match.winner === match.playerA ? 'winner' : 'loser'}">
										{getStudentName(match.playerA)}
									</td>
									<td class="vs-cell">vs</td>
									<td class="player-cell {match.winner === match.playerB ? 'winner' : 'loser'}">
										{getStudentName(match.playerB)}
									</td>
									<td class="result-cell">
										<span class="winner-name">
											{getStudentName(match.winner)}
										</span>
										<span class="result-badge">Won</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.match-history-container {
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

	.loading-state {
		text-align: center;
		padding: 3rem 2rem;
		color: #7f8c8d;
		font-size: 1.1rem;
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

	.filter-controls,
	.sort-controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	label {
		font-weight: 600;
		color: #2c3e50;
		font-size: 0.9rem;
	}

	.student-select {
		padding: 0.5rem 0.75rem;
		border: 2px solid #e9ecef;
		border-radius: 6px;
		font-size: 0.9rem;
		background: white;
		min-width: 150px;
	}

	.student-select:focus {
		outline: none;
		border-color: #3498db;
	}

	.clear-filter-btn,
	.sort-btn {
		padding: 0.5rem 1rem;
		border: 2px solid #e9ecef;
		border-radius: 6px;
		background: white;
		color: #2c3e50;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-filter-btn:hover,
	.sort-btn:hover {
		border-color: #3498db;
		background: #3498db;
		color: white;
	}

	.sort-btn.active {
		background: #3498db;
		color: white;
		border-color: #3498db;
	}

	.match-history-section {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.section-header {
		padding: 1.5rem 2rem;
		background: #f8f9fa;
		border-bottom: 1px solid #e9ecef;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.section-header h2 {
		margin: 0;
		color: #2c3e50;
		font-size: 1.5rem;
	}

	.filter-indicator {
		background: #3498db;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.empty-state {
		padding: 3rem 2rem;
		text-align: center;
		color: #7f8c8d;
		font-size: 1.1rem;
	}

	.matches-table-container {
		overflow-x: auto;
	}

	.matches-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	.matches-table th {
		background: #f8f9fa;
		padding: 1rem;
		text-align: left;
		font-weight: 600;
		color: #2c3e50;
		border-bottom: 2px solid #e9ecef;
	}

	.matches-table td {
		padding: 1rem;
		border-bottom: 1px solid #e9ecef;
		vertical-align: middle;
	}

	.matches-table tr:hover {
		background: #f8f9fa;
	}

	.match-date {
		color: #7f8c8d;
		font-size: 0.85rem;
		white-space: nowrap;
	}

	.player-cell {
		font-weight: 600;
		color: #2c3e50;
	}

	.player-cell.winner {
		color: #27ae60;
	}

	.player-cell.loser {
		color: #e74c3c;
	}

	.vs-cell {
		text-align: center;
		color: #7f8c8d;
		font-weight: 600;
		font-size: 0.8rem;
	}

	.result-cell {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.winner-name {
		font-weight: 600;
		color: #27ae60;
	}

	.result-badge {
		background: #27ae60;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.7rem;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.match-history-container {
			padding: 1rem;
		}

		.controls-section {
			flex-direction: column;
			align-items: stretch;
		}

		.filter-controls,
		.sort-controls {
			justify-content: center;
		}

		.section-header {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}

		.matches-table {
			font-size: 0.8rem;
		}

		.matches-table th,
		.matches-table td {
			padding: 0.75rem 0.5rem;
		}

		.result-cell {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}
</style> 
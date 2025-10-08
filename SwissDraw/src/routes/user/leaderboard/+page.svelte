<script lang="ts">
	import { onMount } from 'svelte';
	import { getStudentsSortedByScore, type Student } from '$lib/students';

	let { data } = $props();
	let students: Student[] = $state([]);
	let loading = $state(true);
	let myRank = $state<number | null>(null);

	onMount(async () => {
		students = await getStudentsSortedByScore(false); // descending
		
		// Find current user's rank
		if (data.user?.studentId) {
			const index = students.findIndex(s => s.id === data.user.studentId);
			if (index !== -1) {
				myRank = index + 1;
			}
		}
		
		loading = false;
	});

	function getRankEmoji(rank: number): string {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `#${rank}`;
	}
</script>

<svelte:head>
	<title>Leaderboard - SwissDraw</title>
</svelte:head>

<div class="leaderboard">
	<header>
		<h1>Tournament Leaderboard</h1>
		<p>See how players rank in the tournament</p>
		{#if myRank}
			<div class="my-rank">
				Your Rank: <strong>{getRankEmoji(myRank)}</strong>
			</div>
		{/if}
	</header>

	<div class="leaderboard-card">
		{#if loading}
			<div class="loading">Loading leaderboard...</div>
		{:else if students.length === 0}
			<div class="empty">No players yet</div>
		{:else}
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Rank</th>
							<th>Player</th>
							<th>Chess.com</th>
							<th>Score</th>
							<th>W-L-D</th>
						</tr>
					</thead>
					<tbody>
						{#each students as student, index}
							<tr class:highlighted={student.id === data.user?.studentId}>
								<td class="rank-cell">
									<span class="rank">{getRankEmoji(index + 1)}</span>
								</td>
								<td class="name-cell">
									<strong>{student.name}</strong>
									{#if student.id === data.user?.studentId}
										<span class="you-badge">YOU</span>
									{/if}
								</td>
								<td class="chess-cell">
									{#if student.chessComUsername}
										<a 
											href="https://www.chess.com/member/{student.chessComUsername}"
											target="_blank"
											rel="noopener noreferrer"
											class="chess-link"
										>
											♟️ {student.chessComUsername}
										</a>
									{:else}
										<span class="no-username">—</span>
									{/if}
								</td>
								<td class="score-cell">
									<span class="score">{student.score || 0}</span>
								</td>
								<td class="record-cell">
									{student.wins || 0}-{student.losses || 0}-{student.draws || 0}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	.leaderboard {
		max-width: 1000px;
	}

	header {
		margin-bottom: 2rem;
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
		margin: 0 0 1rem 0;
	}

	.my-rank {
		display: inline-block;
		background: linear-gradient(135deg, #3498db, #2980b9);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1.1rem;
	}

	.my-rank strong {
		font-size: 1.3rem;
	}

	.leaderboard-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.loading, .empty {
		padding: 3rem;
		text-align: center;
		color: #7f8c8d;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: #f8f9fa;
		border-bottom: 2px solid #e9ecef;
	}

	th {
		padding: 1rem;
		text-align: left;
		font-weight: 600;
		color: #2c3e50;
		text-transform: uppercase;
		font-size: 0.85rem;
		letter-spacing: 0.5px;
	}

	tbody tr {
		border-bottom: 1px solid #e9ecef;
		transition: background-color 0.2s;
	}

	tbody tr:hover {
		background: #f8f9fa;
	}

	tbody tr:last-child {
		border-bottom: none;
	}

	tbody tr.highlighted {
		background: #e3f2fd;
	}

	tbody tr.highlighted:hover {
		background: #d1e7fd;
	}

	td {
		padding: 1rem;
	}

	.rank-cell {
		width: 80px;
	}

	.rank {
		font-size: 1.2rem;
		font-weight: 600;
	}

	.name-cell {
		font-size: 1.05rem;
	}

	.name-cell strong {
		color: #2c3e50;
	}

	.you-badge {
		display: inline-block;
		margin-left: 0.5rem;
		padding: 0.2rem 0.5rem;
		background: #3498db;
		color: white;
		font-size: 0.7rem;
		border-radius: 4px;
		font-weight: 600;
	}

	.chess-cell {
		color: #7f8c8d;
	}

	.chess-link {
		color: #3498db;
		text-decoration: none;
		font-weight: 500;
	}

	.chess-link:hover {
		text-decoration: underline;
	}

	.no-username {
		color: #bdc3c7;
	}

	.score-cell {
		font-weight: 600;
	}

	.score {
		color: #27ae60;
		font-size: 1.1rem;
	}

	.record-cell {
		color: #7f8c8d;
		font-family: monospace;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		.table-container {
			font-size: 0.9rem;
		}

		th, td {
			padding: 0.75rem 0.5rem;
		}

		.rank-cell {
			width: 60px;
		}

		.chess-cell {
			display: none;
		}
	}
</style>

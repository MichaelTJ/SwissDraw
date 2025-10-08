<svelte:head>
	<title>Admin Dashboard - SwissDraw</title>
</svelte:head>

<div class="dashboard">
	<header>
		<h1>Admin Dashboard</h1>
		<p>Manage your Swiss Draw tournament</p>
	</header>

	<div class="cards-grid">
		<a href="/admin/students" class="card">
			<div class="card-icon">👥</div>
			<h2>Students</h2>
			<p>Manage student roster and chess.com usernames</p>
		</a>
		
		<a href="/admin/matches" class="card">
			<div class="card-icon">🏆</div>
			<h2>Matches</h2>
			<p>Record match results and update scores</p>
		</a>
		
		<a href="/admin/leaderboard" class="card">
			<div class="card-icon">📊</div>
			<h2>Leaderboard</h2>
			<p>View rankings and performance statistics</p>
		</a>
		
		<a href="/admin/history" class="card">
			<div class="card-icon">📜</div>
			<h2>Match History</h2>
			<p>Browse complete match records</p>
		</a>
		
		<a href="/admin/opponents" class="card">
			<div class="card-icon">🎯</div>
			<h2>Opponent Finder</h2>
			<p>Find suitable opponents by score similarity</p>
		</a>
		
		<a href="/admin/recommendations" class="card">
			<div class="card-icon">🤖</div>
			<h2>Match Recommendations</h2>
			<p>AI-powered match pairings for tournaments</p>
		</a>
	</div>
</div>

<style>
	.dashboard {
		max-width: 1200px;
	}

	header {
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

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		text-decoration: none;
		color: inherit;
		transition: all 0.3s ease;
		border: 2px solid transparent;
	}

	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		border-color: #3498db;
	}

	.card-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.card h2 {
		color: #2c3e50;
		margin: 0 0 0.5rem 0;
		font-size: 1.4rem;
		font-weight: 600;
	}

	.card p {
		color: #7f8c8d;
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		.cards-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.card {
			padding: 1.5rem;
		}
	}
</style>

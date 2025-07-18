<svelte:head>
	<title>SwissDraw - Tournament Management</title>
</svelte:head>

<div class="container">
	<header>
		<h1>SwissDraw Tournament Manager</h1>
		<p>Manage students, record matches, and track tournament progress</p>
	</header>

	<nav class="navigation">
		<div class="nav-grid">
			<a href="/Students" class="nav-card">
				<div class="nav-icon">👥</div>
				<h2>Students</h2>
				<p>Manage student roster and scores</p>
			</a>
			
			<a href="/Matches" class="nav-card">
				<div class="nav-icon">🏆</div>
				<h2>Matches</h2>
				<p>Record match results and update scores</p>
			</a>
			
			<a href="/Leaderboard" class="nav-card">
				<div class="nav-icon">📊</div>
				<h2>Leaderboard</h2>
				<p>View rankings and performance stats</p>
			</a>
			
			<a href="/History" class="nav-card">
				<div class="nav-icon">📜</div>
				<h2>Match History</h2>
				<p>Browse complete match records</p>
			</a>
			
			<a href="/Opponents" class="nav-card">
				<div class="nav-icon">🎯</div>
				<h2>Opponent Finder</h2>
				<p>Find suitable opponents by score similarity</p>
			</a>
			
			<a href="/Recommendations" class="nav-card">
				<div class="nav-icon">🤖</div>
				<h2>Match Recommendations</h2>
				<p>AI-powered match pairings for tournaments</p>
			</a>
		</div>
	</nav>
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
		margin-bottom: 4rem;
	}

	h1 {
		color: #2c3e50;
		margin-bottom: 0.5rem;
		font-size: 3rem;
		font-weight: 700;
	}

	header p {
		color: #7f8c8d;
		font-size: 1.2rem;
		margin: 0;
	}

	.navigation {
		margin-top: 2rem;
	}

	.nav-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.nav-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		text-decoration: none;
		color: inherit;
		transition: all 0.3s ease;
		text-align: center;
	}

	.nav-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.nav-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.nav-card h2 {
		color: #2c3e50;
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.nav-card p {
		color: #7f8c8d;
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.4;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.nav-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.nav-card {
			padding: 1.5rem;
		}
	}
</style>

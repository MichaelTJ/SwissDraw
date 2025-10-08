<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard - SwissDraw</title>
</svelte:head>

<div class="dashboard">
	<header>
		<h1>Welcome back, {data.user?.name}!</h1>
		<p>Track your tournament progress and stats</p>
	</header>

	<div class="cards-grid">
		<a href="/user/profile" class="card">
			<div class="card-icon">👤</div>
			<h2>My Profile</h2>
			<p>View your stats and link your chess.com profile</p>
		</a>
		
		<a href="/user/leaderboard" class="card">
			<div class="card-icon">📊</div>
			<h2>Leaderboard</h2>
			<p>See how you rank against other players</p>
		</a>
	</div>

	{#if !data.user?.studentId || !data.user?.chessComUsername}
		<div class="alert">
			<h3>⚠️ Complete Your Profile</h3>
			<p>Link your student profile and chess.com username to participate in tournaments.</p>
			<a href="/user/profile" class="alert-link">Complete Profile →</a>
		</div>
	{/if}
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
		margin-bottom: 2rem;
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

	.alert {
		background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%);
		color: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.alert h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
	}

	.alert p {
		margin: 0 0 1rem 0;
		opacity: 0.95;
	}

	.alert-link {
		display: inline-block;
		background: white;
		color: #e74c3c;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: transform 0.2s;
	}

	.alert-link:hover {
		transform: translateY(-2px);
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

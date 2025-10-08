<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	// Redirect if already logged in
	onMount(() => {
		if (data.session?.user) {
			if (data.user?.role === 'admin') {
				goto('/admin');
			} else {
				goto('/user');
			}
		}
	});

	async function handleSignIn() {
		await signIn('microsoft-entra-id', { callbackUrl: '/auth/callback' });
	}
</script>

<svelte:head>
	<title>SwissDraw - Tournament Management</title>
</svelte:head>

<div class="landing">
	<div class="hero">
		<div class="hero-content">
			<div class="logo">♟️</div>
			<h1>SwissDraw Tournament Manager</h1>
			<p>Manage chess tournaments with Swiss-system pairings</p>
			
			<button class="signin-btn" onclick={handleSignIn}>
				<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M10.5 0C4.7 0 0 4.7 0 10.5S4.7 21 10.5 21 21 16.3 21 10.5 16.3 0 10.5 0z" fill="#f25022"/>
					<path d="M10.5 0v10.5H21C21 4.7 16.3 0 10.5 0z" fill="#7fba00"/>
					<path d="M10.5 21V10.5H0c0 5.8 4.7 10.5 10.5 10.5z" fill="#00a4ef"/>
					<path d="M21 10.5H10.5V21c5.8 0 10.5-4.7 10.5-10.5z" fill="#ffb900"/>
				</svg>
				Sign in with Microsoft
			</button>
		</div>

		<div class="features">
			<div class="feature">
				<div class="feature-icon">👥</div>
				<h3>Student Management</h3>
				<p>Track players and their chess.com profiles</p>
			</div>
			<div class="feature">
				<div class="feature-icon">🏆</div>
				<h3>Match Tracking</h3>
				<p>Record results and calculate standings</p>
			</div>
			<div class="feature">
				<div class="feature-icon">🤖</div>
				<h3>Smart Pairings</h3>
				<p>AI-powered Swiss-system match recommendations</p>
			</div>
		</div>
	</div>

	<footer class="landing-footer">
		<p>© 2025 SwissDraw - St Brendan's College</p>
	</footer>
</div>

<style>
	.landing {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.hero {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 4rem 2rem;
		text-align: center;
		color: white;
	}

	.hero-content {
		max-width: 600px;
		margin-bottom: 4rem;
	}

	.logo {
		font-size: 5rem;
		margin-bottom: 1rem;
		animation: float 3s ease-in-out infinite;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-10px); }
	}

	h1 {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: 1rem;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.hero-content p {
		font-size: 1.3rem;
		margin-bottom: 2.5rem;
		opacity: 0.95;
	}

	.signin-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 2rem;
		background: white;
		color: #2c3e50;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
	}

	.signin-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
	}

	.signin-btn svg {
		width: 24px;
		height: 24px;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		max-width: 900px;
		width: 100%;
	}

	.feature {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature h3 {
		font-size: 1.3rem;
		margin: 0 0 0.5rem 0;
		font-weight: 600;
	}

	.feature p {
		margin: 0;
		opacity: 0.9;
		font-size: 0.95rem;
	}

	.landing-footer {
		padding: 2rem;
		text-align: center;
		color: white;
		opacity: 0.8;
	}

	.landing-footer p {
		margin: 0;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		.hero-content p {
			font-size: 1.1rem;
		}

		.logo {
			font-size: 3.5rem;
		}

		.features {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.feature {
			padding: 1.5rem;
		}
	}
</style>

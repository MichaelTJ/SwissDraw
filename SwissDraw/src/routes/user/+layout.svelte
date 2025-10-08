<script lang="ts">
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';

	let { data } = $props();
	
	const navLinks = [
		{ href: '/user', label: 'Dashboard', icon: '🏠' },
		{ href: '/user/profile', label: 'My Profile', icon: '👤' },
		{ href: '/user/leaderboard', label: 'Leaderboard', icon: '📊' }
	];
</script>

<div class="layout">
	<nav class="sidebar">
		<div class="sidebar-header">
			<h2>SwissDraw</h2>
			<p class="user-info">👤 {data.user?.name || data.user?.email}</p>
		</div>
		
		<ul class="nav-links">
			{#each navLinks as link}
				<li>
					<a 
						href={link.href}
						class:active={$page.url.pathname === link.href}
					>
						<span class="icon">{link.icon}</span>
						<span class="label">{link.label}</span>
					</a>
				</li>
			{/each}
		</ul>

		<div class="sidebar-footer">
			<button class="signout-btn" onclick={() => signOut()}>
				🚪 Sign Out
			</button>
		</div>
	</nav>

	<main class="content">
		<slot />
	</main>
</div>

<style>
	.layout {
		display: flex;
		min-height: 100vh;
		background: #f5f7fa;
	}

	.sidebar {
		width: 260px;
		background: #34495e;
		color: white;
		display: flex;
		flex-direction: column;
		position: fixed;
		height: 100vh;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 2rem 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.sidebar-header h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.user-info {
		margin: 0;
		font-size: 0.85rem;
		opacity: 0.8;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nav-links {
		list-style: none;
		padding: 1rem 0;
		margin: 0;
		flex: 1;
	}

	.nav-links li {
		margin: 0;
	}

	.nav-links a {
		display: flex;
		align-items: center;
		padding: 0.875rem 1.5rem;
		color: rgba(255, 255, 255, 0.8);
		text-decoration: none;
		transition: all 0.2s;
		border-left: 3px solid transparent;
	}

	.nav-links a:hover {
		background: rgba(255, 255, 255, 0.05);
		color: white;
	}

	.nav-links a.active {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border-left-color: #3498db;
	}

	.nav-links .icon {
		font-size: 1.25rem;
		margin-right: 0.75rem;
	}

	.nav-links .label {
		font-size: 0.95rem;
		font-weight: 500;
	}

	.sidebar-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.signout-btn {
		width: 100%;
		padding: 0.75rem;
		background: rgba(231, 76, 60, 0.8);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.signout-btn:hover {
		background: #e74c3c;
	}

	.content {
		margin-left: 260px;
		flex: 1;
		padding: 2rem;
		min-height: 100vh;
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 100%;
			position: static;
			height: auto;
		}

		.content {
			margin-left: 0;
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { getStudents, type Student } from '$lib/students';

	let { data } = $props();
	let students = $state<Student[]>([]);
	let selectedStudentId = $state(data.user?.studentId || '');
	let chessComUsername = $state(data.user?.chessComUsername || '');
	let loading = $state(false);
	let message = $state('');
	let linkedStudent: Student | null = $state(null);

	onMount(async () => {
		students = await getStudents();
		
		// Find linked student if already linked
		if (data.user?.studentId) {
			linkedStudent = students.find(s => s.id === data.user.studentId) || null;
		}
	});

	async function saveProfile() {
		if (!selectedStudentId || !chessComUsername.trim()) {
			message = 'Please select a student and enter your chess.com username';
			return;
		}

		loading = true;
		message = '';

		try {
			const response = await fetch('/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId: data.user?.id,
					studentId: selectedStudentId,
					chessComUsername: chessComUsername.trim()
				})
			});

			if (response.ok) {
				message = 'Profile updated successfully! ✓';
				linkedStudent = students.find(s => s.id === selectedStudentId) || null;
			} else {
				const error = await response.json();
				message = `Error: ${error.error || 'Failed to update profile'}`;
			}
		} catch (error) {
			message = 'Error updating profile. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>My Profile - SwissDraw</title>
</svelte:head>

<div class="profile">
	<header>
		<h1>My Profile</h1>
		<p>Link your student profile and chess.com account</p>
	</header>

	<div class="profile-card">
		<div class="profile-section">
			<h2>Account Information</h2>
			<div class="info-row">
				<span class="label">Name:</span>
				<span class="value">{data.user?.name}</span>
			</div>
			<div class="info-row">
				<span class="label">Email:</span>
				<span class="value">{data.user?.email}</span>
			</div>
			<div class="info-row">
				<span class="label">Role:</span>
				<span class="value badge">{data.user?.role}</span>
			</div>
		</div>

		<div class="profile-section">
			<h2>Link Student Profile</h2>
			<p class="section-desc">Select your name from the student roster</p>
			
			<div class="form-group">
				<label for="student-select">Student Name</label>
				<select 
					id="student-select" 
					bind:value={selectedStudentId}
					disabled={loading}
				>
					<option value="">-- Select your name --</option>
					{#each students as student}
						<option value={student.id}>{student.name}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="chess-username">Chess.com Username *</label>
				<input
					id="chess-username"
					type="text"
					placeholder="Your chess.com username"
					bind:value={chessComUsername}
					disabled={loading}
				/>
				<small>This is required to participate in tournaments</small>
			</div>

			<button 
				class="save-btn" 
				onclick={saveProfile}
				disabled={loading || !selectedStudentId || !chessComUsername.trim()}
			>
				{loading ? 'Saving...' : 'Save Profile'}
			</button>

			{#if message}
				<div class="message" class:success={message.includes('✓')} class:error={message.includes('Error')}>
					{message}
				</div>
			{/if}
		</div>

		{#if linkedStudent}
			<div class="profile-section stats">
				<h2>Your Tournament Stats</h2>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-value">{linkedStudent.score || 0}</div>
						<div class="stat-label">Score</div>
					</div>
					<div class="stat-card">
						<div class="stat-value">{linkedStudent.wins || 0}</div>
						<div class="stat-label">Wins</div>
					</div>
					<div class="stat-card">
						<div class="stat-value">{linkedStudent.losses || 0}</div>
						<div class="stat-label">Losses</div>
					</div>
					<div class="stat-card">
						<div class="stat-value">{linkedStudent.draws || 0}</div>
						<div class="stat-label">Draws</div>
					</div>
				</div>
				
				{#if linkedStudent.chessComUsername}
					<div class="chess-link">
						<a 
							href="https://www.chess.com/member/{linkedStudent.chessComUsername}" 
							target="_blank"
							rel="noopener noreferrer"
						>
							♟️ View Chess.com Profile →
						</a>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.profile {
		max-width: 800px;
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
		margin: 0;
	}

	.profile-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.profile-section {
		padding: 2rem;
		border-bottom: 1px solid #e9ecef;
	}

	.profile-section:last-child {
		border-bottom: none;
	}

	.profile-section h2 {
		margin: 0 0 1rem 0;
		color: #2c3e50;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.section-desc {
		color: #7f8c8d;
		margin: 0 0 1.5rem 0;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.label {
		font-weight: 600;
		color: #2c3e50;
	}

	.value {
		color: #7f8c8d;
	}

	.badge {
		background: #3498db;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
		text-transform: capitalize;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #2c3e50;
	}

	.form-group select,
	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-group select:focus,
	.form-group input:focus {
		outline: none;
		border-color: #3498db;
	}

	.form-group small {
		display: block;
		margin-top: 0.5rem;
		color: #7f8c8d;
		font-size: 0.85rem;
	}

	.save-btn {
		width: 100%;
		padding: 0.875rem;
		background: #27ae60;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.save-btn:hover:not(:disabled) {
		background: #229954;
		transform: translateY(-1px);
	}

	.save-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.message {
		margin-top: 1rem;
		padding: 0.875rem;
		border-radius: 8px;
		text-align: center;
		font-weight: 500;
	}

	.message.success {
		background: #d4edda;
		color: #155724;
	}

	.message.error {
		background: #f8d7da;
		color: #721c24;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-card {
		text-align: center;
		padding: 1.5rem;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #3498db;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #7f8c8d;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.chess-link {
		text-align: center;
		padding-top: 1rem;
		border-top: 1px solid #e9ecef;
	}

	.chess-link a {
		display: inline-block;
		color: #3498db;
		text-decoration: none;
		font-weight: 600;
		font-size: 1.1rem;
		transition: transform 0.2s;
	}

	.chess-link a:hover {
		transform: translateX(4px);
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		.info-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>

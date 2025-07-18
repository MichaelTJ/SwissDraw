<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		getStudents, 
		addStudent as addStudentUtil, 
		updateStudent, 
		deleteStudent as deleteStudentUtil, 
		clearAllStudents as clearAllStudentsUtil,
		type Student 
	} from '$lib/students';

	let students: Student[] = [];
	let newStudentName = '';
	let newStudentScore = 0;
	let editingStudent: Student | null = null;
	let editName = '';
	let editScore = 0;
	let loading = false;

	// Load students from server on mount
	onMount(async () => {
		loading = true;
		students = await getStudents();
		loading = false;
	});

	async function addStudent() {
		if (newStudentName.trim()) {
			loading = true;
			const newStudent = await addStudentUtil(newStudentName, newStudentScore);
			if (newStudent) {
				students = [...students, newStudent];
				newStudentName = '';
				newStudentScore = 0;
			}
			loading = false;
		}
	}

	function startEdit(student: Student) {
		editingStudent = student;
		editName = student.name;
		editScore = student.score;
	}

	async function saveEdit() {
		if (editingStudent && editName.trim()) {
			loading = true;
			const updatedStudent = await updateStudent(editingStudent.id, editName, editScore);
			if (updatedStudent) {
				students = students.map(s => 
					s.id === editingStudent!.id ? updatedStudent : s
				);
			}
			editingStudent = null;
			editName = '';
			editScore = 0;
			loading = false;
		}
	}

	function cancelEdit() {
		editingStudent = null;
		editName = '';
		editScore = 0;
	}

	async function deleteStudent(id: string) {
		loading = true;
		const success = await deleteStudentUtil(id);
		if (success) {
			students = students.filter(s => s.id !== id);
		}
		loading = false;
	}

	async function clearAllStudents() {
		if (confirm('Are you sure you want to delete all students?')) {
			loading = true;
			await clearAllStudentsUtil();
			students = [];
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Students - SwissDraw</title>
</svelte:head>

<div class="container">
	<header>
		<h1>Students Management</h1>
		<p>Manage your students and their scores for SwissDraw tournaments</p>
	</header>

	<!-- Add New Student Form -->
	<div class="add-form">
		<h2>Add New Student</h2>
		<div class="form-row">
			<input
				type="text"
				placeholder="Student name"
				bind:value={newStudentName}
				on:keydown={(e) => e.key === 'Enter' && addStudent()}
				disabled={loading}
			/>
			<input
				type="number"
				placeholder="Score"
				bind:value={newStudentScore}
				min="0"
				on:keydown={(e) => e.key === 'Enter' && addStudent()}
				disabled={loading}
			/>
			<button on:click={addStudent} disabled={!newStudentName.trim() || loading}>
				{loading ? 'Adding...' : 'Add Student'}
			</button>
		</div>
	</div>

	<!-- Students List -->
	<div class="students-section">
		<div class="section-header">
			<h2>Students ({students.length})</h2>
			{#if students.length > 0}
				<button class="clear-btn" on:click={clearAllStudents} disabled={loading}>
					{loading ? 'Clearing...' : 'Clear All'}
				</button>
			{/if}
		</div>

		{#if loading && students.length === 0}
			<div class="empty-state">
				<p>Loading students...</p>
			</div>
		{:else if students.length === 0}
			<div class="empty-state">
				<p>No students added yet. Add your first student above!</p>
			</div>
		{:else}
			<div class="students-list">
				{#each students as student (student.id)}
					<div class="student-card">
						{#if editingStudent?.id === student.id}
							<!-- Edit Mode -->
							<div class="edit-form">
								<input
									type="text"
									bind:value={editName}
									on:keydown={(e) => e.key === 'Enter' && saveEdit()}
								/>
								<input
									type="number"
									bind:value={editScore}
									min="0"
									on:keydown={(e) => e.key === 'Enter' && saveEdit()}
								/>
								<div class="edit-actions">
									<button class="save-btn" on:click={saveEdit} disabled={loading}>
										{loading ? 'Saving...' : 'Save'}
									</button>
									<button class="cancel-btn" on:click={cancelEdit} disabled={loading}>
										Cancel
									</button>
								</div>
							</div>
						{:else}
							<!-- Display Mode -->
							<div class="student-info">
								<span class="student-name">{student.name}</span>
								<span class="student-score">Score: {student.score}</span>
							</div>
							<div class="student-actions">
								<button class="edit-btn" on:click={() => startEdit(student)} disabled={loading}>
									Edit
								</button>
								<button class="delete-btn" on:click={() => deleteStudent(student.id)} disabled={loading}>
									{loading ? 'Deleting...' : 'Delete'}
								</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		max-width: 800px;
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

	.add-form {
		background: #f8f9fa;
		padding: 2rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.add-form h2 {
		margin: 0 0 1rem 0;
		color: #2c3e50;
		font-size: 1.5rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	input[type="text"],
	input[type="number"] {
		flex: 1;
		min-width: 200px;
		padding: 0.75rem 1rem;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input[type="text"]:focus,
	input[type="number"]:focus {
		outline: none;
		border-color: #3498db;
	}

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	button:not(:disabled):hover {
		transform: translateY(-1px);
	}

	.add-form button {
		background: #27ae60;
		color: white;
	}

	.add-form button:hover:not(:disabled) {
		background: #229954;
	}

	.students-section {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		background: #f8f9fa;
		border-bottom: 1px solid #e9ecef;
	}

	.section-header h2 {
		margin: 0;
		color: #2c3e50;
		font-size: 1.5rem;
	}

	.clear-btn {
		background: #e74c3c;
		color: white;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
	}

	.clear-btn:hover {
		background: #c0392b;
	}

	.empty-state {
		padding: 3rem 2rem;
		text-align: center;
		color: #7f8c8d;
	}

	.students-list {
		padding: 0;
	}

	.student-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		border-bottom: 1px solid #e9ecef;
		transition: background-color 0.2s;
	}

	.student-card:hover {
		background: #f8f9fa;
	}

	.student-card:last-child {
		border-bottom: none;
	}

	.student-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.student-name {
		font-weight: 600;
		color: #2c3e50;
		font-size: 1.1rem;
	}

	.student-score {
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	.student-actions {
		display: flex;
		gap: 0.5rem;
	}

	.edit-btn {
		background: #3498db;
		color: white;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
	}

	.edit-btn:hover {
		background: #2980b9;
	}

	.delete-btn {
		background: #e74c3c;
		color: white;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
	}

	.delete-btn:hover {
		background: #c0392b;
	}

	.edit-form {
		display: flex;
		gap: 1rem;
		align-items: center;
		width: 100%;
	}

	.edit-form input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 2px solid #e9ecef;
		border-radius: 6px;
		font-size: 0.9rem;
	}

	.edit-form input:focus {
		outline: none;
		border-color: #3498db;
	}

	.edit-actions {
		display: flex;
		gap: 0.5rem;
	}

	.save-btn {
		background: #27ae60;
		color: white;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
	}

	.save-btn:hover {
		background: #229954;
	}

	.cancel-btn {
		background: #95a5a6;
		color: white;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
	}

	.cancel-btn:hover {
		background: #7f8c8d;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		.form-row {
			flex-direction: column;
			align-items: stretch;
		}

		.student-card {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.student-actions {
			justify-content: center;
		}

		.edit-form {
			flex-direction: column;
		}

		.edit-actions {
			justify-content: center;
		}
	}
</style>

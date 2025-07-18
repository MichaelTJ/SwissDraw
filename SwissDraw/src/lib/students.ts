export interface Student {
	id: string;
	name: string;
	score: number;
}

export async function getStudents(): Promise<Student[]> {
	try {
		const response = await fetch('/api/students');
		if (!response.ok) {
			throw new Error('Failed to fetch students');
		}
		return await response.json();
	} catch (error) {
		console.error('Error fetching students:', error);
		return [];
	}
}

export async function addStudent(name: string, score: number): Promise<Student | null> {
	try {
		const response = await fetch('/api/students', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name, score })
		});
		
		if (!response.ok) {
			throw new Error('Failed to add student');
		}
		
		return await response.json();
	} catch (error) {
		console.error('Error adding student:', error);
		return null;
	}
}

export async function updateStudent(id: string, name: string, score: number): Promise<Student | null> {
	try {
		const response = await fetch('/api/students', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id, name, score })
		});
		
		if (!response.ok) {
			throw new Error('Failed to update student');
		}
		
		return await response.json();
	} catch (error) {
		console.error('Error updating student:', error);
		return null;
	}
}

export async function deleteStudent(id: string): Promise<boolean> {
	try {
		const response = await fetch('/api/students', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id })
		});
		
		if (!response.ok) {
			throw new Error('Failed to delete student');
		}
		
		return true;
	} catch (error) {
		console.error('Error deleting student:', error);
		return false;
	}
}

export async function clearAllStudents(): Promise<boolean> {
	try {
		const students = await getStudents();
		const deletePromises = students.map(student => deleteStudent(student.id));
		await Promise.all(deletePromises);
		return true;
	} catch (error) {
		console.error('Error clearing students:', error);
		return false;
	}
}

export async function getStudentById(id: string): Promise<Student | null> {
	try {
		const students = await getStudents();
		return students.find(s => s.id === id) || null;
	} catch (error) {
		console.error('Error getting student by ID:', error);
		return null;
	}
}

export async function getStudentsSortedByScore(ascending: boolean = false): Promise<Student[]> {
	try {
		const students = await getStudents();
		return [...students].sort((a, b) => {
			if (ascending) {
				return a.score - b.score;
			}
			return b.score - a.score;
		});
	} catch (error) {
		console.error('Error getting sorted students:', error);
		return [];
	}
} 
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			auth: () => Promise<{
				user?: {
					name?: string | null;
					email?: string | null;
					image?: string | null;
					id?: string;
				};
				expires?: string;
			} | null>;
			user?: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export interface User {
	id: string;
	email: string;
	name: string;
	role: 'admin' | 'user';
	studentId?: string | null;
	chessComUsername?: string | null;
	createdAt: string;
}

declare module '*.svelte' {
	import type { ComponentType } from 'svelte';
	const component: ComponentType;
	export default component;
}

export {};

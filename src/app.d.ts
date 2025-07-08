// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Platform {
			env: {
				DB: D1Database;
			};
		}
		interface Locals {
			user: User;
			outlet: Outlet;
			db: DrizzleD1Database<any>;
		}
	}
}

export {};

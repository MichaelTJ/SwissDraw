import { SvelteKitAuth } from "@auth/sveltekit";
import MicrosoftEntraId from "@auth/core/providers/microsoft-entra-id";
import {
	MICROSOFT_CLIENT_ID,
	MICROSOFT_CLIENT_SECRET,
	MICROSOFT_TENANT_ID,
	AUTH_SECRET
} from "$env/static/private";

// Verify environment variables are loaded (helps debug Vercel issues)
if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET || !MICROSOFT_TENANT_ID || !AUTH_SECRET) {
	console.error('Missing required environment variables:', {
		hasClientId: !!MICROSOFT_CLIENT_ID,
		hasClientSecret: !!MICROSOFT_CLIENT_SECRET,
		hasTenantId: !!MICROSOFT_TENANT_ID,
		hasAuthSecret: !!AUTH_SECRET
	});
}

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		MicrosoftEntraId({
			clientId: MICROSOFT_CLIENT_ID,
			clientSecret: MICROSOFT_CLIENT_SECRET,
			tenantId: MICROSOFT_TENANT_ID,
			issuer: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/v2.0`,
			authorization: {
				params: {
					scope: "openid profile email User.Read"
				}
			}
		})
	],
	secret: AUTH_SECRET,
	trustHost: true,
	basePath: '/auth',
	debug: true, // Enable debug logging for Vercel
	callbacks: {
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub as string;
				session.user.email = token.email as string;
			}
			return session;
		},
		async jwt({ token, account, profile }) {
			if (account && profile) {
				token.sub = profile.sub;
				token.email = profile.email;
			}
			return token;
		}
	}
});

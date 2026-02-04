import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    // baseURL will be automatically inferred or can be set via env var BETTER_AUTH_URL
})

export const { signIn, signUp, useSession } = authClient;

// Alias for compatibility
export const createClient = authClient;

import { createAuthClient } from "better-auth/react";

// since both sign in and sign up are the client component we use creatAuthClient.
export const authCLient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const { signIn, signOut, signUp, useSession } = authCLient;

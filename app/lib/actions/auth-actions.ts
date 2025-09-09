'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData, ApiResponse } from '../types';

/**
 * Authenticate a user using email and password via the server-side Supabase client.
 *
 * Attempts to sign in with the provided credentials and returns an ApiResponse indicating
 * success (error: null) or failure (error: string). On unexpected failures the function
 * returns a generic error message.
 *
 * @param data - Login credentials containing `email` and `password`
 * @returns An ApiResponse where `error` is null on success or a string describing the failure
 */
export async function login(data: LoginFormData): Promise<ApiResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred during login' };
  }
}

/**
 * Create a new user account using email, password, and a display name.
 *
 * Attempts to register the user with Supabase and stores `name` as user metadata.
 * The function returns an ApiResponse with `error: null` on success or `error: string`
 * containing the Supabase error message or a generic message for unexpected failures.
 *
 * @param data - Registration payload containing `email`, `password`, and `name`.
 * @returns An ApiResponse: `error` is `null` on success or a descriptive error message on failure.
 */
export async function register(data: RegisterFormData): Promise<ApiResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'An unexpected error occurred during registration' };
  }
}

/**
 * Terminates the current user session and clears authentication state.
 * 
 * This function is essential for secure session management, ensuring users can properly
 * log out and preventing unauthorized access to their accounts. It clears both server-side
 * session data and client-side authentication state.
 * 
 * Security Context:
 * - Invalidates server-side session tokens
 * - Clears client-side authentication cookies
 * - Prevents session hijacking after logout
 * - Triggers auth state change to update UI components
 * 
 * Assumptions:
 * - User has an active session to terminate
 * - Supabase client is properly configured
 * - Client-side auth context will handle state updates
 * 
 * Edge Cases:
 * - No active session: Supabase handles gracefully, no error thrown
 * - Network failure: Logout may not complete, requiring retry
 * - Concurrent requests: Multiple logout calls are handled safely
 * 
 * Integration:
 * - Called from logout button in dashboard header
 * - Triggers redirect to login page via middleware
 * - Updates AuthContext to clear user state
 * - Clears any cached user data in components
 * 
 * @returns Promise resolving to error state (null on success, error message on failure)
 */
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Retrieves the currently authenticated user from the server-side session.
 * 
 * This function provides server-side access to user information for authorization
 * decisions and user-specific data operations. It's used in Server Components
 * and Server Actions where client-side auth context is not available.
 * 
 * Security Context:
 * - Server-side execution prevents client-side session manipulation
 * - Returns null for unauthenticated requests
 * - User data includes metadata for authorization decisions
 * 
 * Assumptions:
 * - Supabase SSR client is properly configured with session cookies
 * - User session is valid and not expired
 * - Server-side environment has access to session cookies
 * 
 * Edge Cases:
 * - No session: Returns null user object
 * - Expired session: Supabase handles refresh or returns null
 * - Invalid session: Returns null without throwing error
 * 
 * Integration:
 * - Used in Server Actions for authorization checks
 * - Called from Server Components for user-specific rendering
 * - Provides user ID for database queries and ownership checks
 * - Used by admin functions to verify admin status
 * 
 * @returns Promise resolving to User object or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Retrieves the current session data including tokens and user information.
 * 
 * This function provides access to the complete session state, including
 * access tokens, refresh tokens, and user metadata. It's primarily used
 * for session validation and token management operations.
 * 
 * Security Context:
 * - Server-side execution ensures secure token handling
 * - Returns null for unauthenticated or expired sessions
 * - Tokens are not exposed to client-side code
 * 
 * Assumptions:
 * - Supabase SSR client is properly configured
 * - Session cookies are present and valid
 * - Server environment can access encrypted session data
 * 
 * Edge Cases:
 * - No session: Returns null session object
 * - Expired session: Returns null, may trigger refresh
 * - Corrupted session: Returns null, user must re-authenticate
 * 
 * Integration:
 * - Used for session validation in middleware
 * - Provides session data for token refresh operations
 * - Used by auth context for initial session loading
 * - Enables session-based authorization decisions
 * 
 * @returns Promise resolving to Session object or null if no active session
 */
export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData, ApiResponse } from '../types';

/**
 * Authenticates a user with email and password credentials.
 * 
 * This function serves as the primary entry point for user authentication in the polling app.
 * It's critical for maintaining session state and ensuring only authenticated users can access
 * protected features like poll creation, voting, and dashboard management.
 * 
 * Security Context:
 * - Uses Supabase's built-in authentication which handles password hashing and session management
 * - Server-side execution prevents credential exposure to client-side code
 * - Returns generic error messages to prevent user enumeration attacks
 * 
 * Assumptions:
 * - User has already validated email/password format on client side
 * - Supabase client is properly configured with valid credentials
 * - User account exists and is not disabled
 * 
 * Edge Cases:
 * - Invalid credentials: Returns error without revealing if email exists
 * - Network failures: Supabase client handles retries and error states
 * - Account disabled: Supabase returns appropriate error message
 * 
 * Integration:
 * - Called from login form components in (auth) route group
 * - Success triggers middleware to redirect to dashboard
 * - Session state managed by Supabase SSR client
 * 
 * @param data - Login credentials containing email and password
 * @returns Promise resolving to error state (null on success, error message on failure)
 */
export async function login(data: LoginFormData): Promise<ApiResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error('Login authentication error:', error);
      return { error: 'Invalid credentials' };
    }

    return { error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred during login' };
  }
}

/**
 * Registers a new user account with email, password, and profile information.
 * 
 * This function creates new user accounts in the polling system, enabling users to participate
 * in poll creation, voting, and dashboard management. The registration process includes
 * profile metadata storage for personalized experiences.
 * 
 * Security Context:
 * - Supabase handles password strength validation and secure storage
 * - Email confirmation may be required based on Supabase configuration
 * - User metadata is stored securely and can be used for authorization decisions
 * 
 * Assumptions:
 * - Email is unique (Supabase enforces this constraint)
 * - Password meets minimum security requirements
 * - Name field is provided for user identification
 * - Supabase email confirmation is configured appropriately
 * 
 * Edge Cases:
 * - Duplicate email: Supabase returns specific error for email already exists
 * - Weak password: Supabase validates password strength and returns error
 * - Email confirmation required: User may need to verify email before full access
 * - Network issues: Registration may fail silently, requiring retry
 * 
 * Integration:
 * - Called from registration form in (auth) route group
 * - Success may require email verification before login
 * - User metadata becomes available for profile display and admin checks
 * - Triggers auth state change in AuthContext
 * 
 * @param data - Registration data containing email, password, and name
 * @returns Promise resolving to error state (null on success, error message on failure)
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
      console.error('Registration authentication error:', error);
      return { error: 'Registration failed. Please try again or use the login/password reset flow.' };
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
    console.error('Logout error:', error);
    return { error: 'Logout failed' };
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

'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Authentication context interface defining the shape of auth state and methods.
 * 
 * This interface provides a consistent contract for authentication state across
 * the application, enabling components to access user information and authentication
 * methods without directly coupling to Supabase implementation details.
 * 
 * Context Properties:
 * - session: Complete session data including tokens (null if not authenticated)
 * - user: User object with profile information (null if not authenticated)
 * - signOut: Function to terminate current session
 * - loading: Boolean indicating if auth state is being determined
 */
const AuthContext = createContext<{ 
  session: Session | null;
  user: User | null;
  signOut: () => void;
  loading: boolean;
}>({ 
  session: null, 
  user: null,
  signOut: () => {},
  loading: true,
});

/**
 * Authentication provider component that manages global authentication state.
 * 
 * This component serves as the central authentication hub for the polling application,
 * providing real-time auth state to all child components. It handles session initialization,
 * auth state changes, and provides methods for session management.
 * 
 * Key Responsibilities:
 * - Initialize authentication state from existing session
 * - Listen for authentication state changes (login/logout)
 * - Provide signOut functionality to child components
 * - Manage loading states during auth operations
 * 
 * Security Considerations:
 * - Uses client-side Supabase client for real-time auth updates
 * - Handles session persistence across page refreshes
 * - Prevents memory leaks with proper cleanup of auth listeners
 * - Manages loading states to prevent UI flicker
 * 
 * Assumptions:
 * - Supabase client is properly configured with valid credentials
 * - Browser supports localStorage for session persistence
 * - Network connectivity is available for auth operations
 * 
 * Edge Cases:
 * - Network disconnection: Auth state remains cached until reconnection
 * - Session expiration: Supabase handles refresh automatically
 * - Multiple tabs: Auth state syncs across browser tabs
 * - Component unmount: Properly cleans up auth listeners
 * 
 * Integration:
 * - Wraps entire application in root layout
 * - Provides auth state to dashboard layout for user menu
 * - Used by protected routes to determine access
 * - Enables conditional rendering based on auth status
 * 
 * @param children - React components that need access to auth context
 * @returns JSX element providing auth context to children
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    /**
     * Initialize authentication state from existing session.
     * 
     * This function retrieves the current session on component mount, ensuring
     * that users remain authenticated across page refreshes and browser sessions.
     * It's critical for maintaining seamless user experience and preventing
     * unnecessary re-authentication.
     */
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      }
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('AuthContext: Initial session loaded', session?.user);
      }
    };

    getInitialSession();

    /**
     * Listen for authentication state changes.
     * 
     * This listener handles real-time auth state updates including login, logout,
     * session refresh, and token expiration. It ensures the UI stays synchronized
     * with the actual authentication state across all components.
     */
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('AuthContext: Auth state changed', _event, session?.user);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  /**
   * Sign out the current user and clear authentication state.
   * 
   * This function terminates the current session and triggers auth state
   * updates throughout the application. It's used by logout buttons
   * and automatic logout scenarios.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  console.log('AuthContext: user', user);
  return (
    <AuthContext.Provider value={{ session, user, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context throughout the application.
 * 
 * This hook provides a convenient way for components to access authentication
 * state and methods without prop drilling. It should be used in any component
 * that needs to check authentication status or perform auth-related operations.
 * 
 * Usage:
 * ```tsx
 * const { user, loading, signOut } = useAuth();
 * 
 * if (loading) return <LoadingSpinner />;
 * if (!user) return <LoginPrompt />;
 * 
 * return <AuthenticatedContent />;
 * ```
 * 
 * @returns Authentication context containing user, session, loading state, and signOut method
 */
export const useAuth = () => useContext(AuthContext);

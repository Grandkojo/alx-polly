// Database schema types (aligned with actual Supabase schema)
export interface Poll {
  id: string;
  question: string;
  options: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  user_id: string | null; // null for anonymous votes
  option_index: number;
  created_at: string;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string | null;
}

export interface PollResult {
  option: string;
  count: number;
  percentage: number;
}

export interface PollWithResults extends Poll {
  results: PollResult[];
  userVote: number | null;
  totalVotes: number;
}

// Component prop types
export interface PollActionsProps {
  poll: Poll;
}

export interface PollVotingFormProps {
  poll: Poll;
  results?: PollResult[];
  userVote?: number | null;
}

// Auth context types
export interface AuthContextType {
  session: any | null; // Supabase Session type
  user: any | null; // Supabase User type
  signOut: () => void;
  loading: boolean;
}
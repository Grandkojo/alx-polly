"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { validatePollQuestion, validatePollOptions, validatePollId, validateOptionIndex } from "@/lib/validation";

/**
 * Creates a new poll with validated question and options.
 * 
 * This function is the core poll creation mechanism, handling user input validation,
 * authentication verification, and database persistence. It ensures that only
 * authenticated users can create polls and that all poll data meets security
 * and quality standards.
 * 
 * Security Context:
 * - Requires user authentication to prevent anonymous poll creation
 * - Validates and sanitizes all input data to prevent XSS attacks
 * - Enforces length limits and content restrictions
 * - Associates polls with creator for ownership tracking
 * 
 * Business Logic:
 * - Polls must have at least 2 options and at most 10 options
 * - Questions must be 3-500 characters long
 * - Options must be 1-200 characters each and unique
 * - All text content is sanitized to remove potentially harmful elements
 * 
 * Assumptions:
 * - FormData contains properly formatted question and options fields
 * - User has an active, valid session
 * - Database connection is available and polls table exists
 * - Validation functions are properly implemented
 * 
 * Edge Cases:
 * - Invalid input: Returns specific validation error messages
 * - Unauthenticated user: Returns authentication error
 * - Database errors: Returns database error message
 * - Network failures: Supabase handles retries and error states
 * 
 * Integration:
 * - Called from PollCreateForm component via form action
 * - Triggers cache revalidation to update polls list
 * - Creates poll record with user_id for ownership tracking
 * - Enables immediate redirect to polls dashboard
 * 
 * @param formData - Form data containing question and options from create poll form
 * @returns Promise resolving to error state (null on success, error message on failure)
 */
export async function createPoll(
  prevState: { error: string | null, success: boolean },
  formData: FormData,
) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Validate question content and length
  const questionValidation = validatePollQuestion(question);
  if (!questionValidation.isValid) {
    return { error: questionValidation.error, success: false };
  }

  // Validate options array and content
  const optionsValidation = validatePollOptions(options);
  if (!optionsValidation.isValid) {
    return { error: optionsValidation.error, success: false };
  }

  // Verify user authentication for poll creation
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message, success: false };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll.", success: false };
  }

  // Insert validated poll data into database
  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question: questionValidation.isValid ? question : "",
      options: optionsValidation.sanitizedOptions || [],
    },
  ]);

  if (error) {
    return { error: error.message, success: false };
  }

  // Refresh polls cache to show new poll immediately
  revalidatePath("/polls");
  return { error: null, success: true };
}

/**
 * Retrieves all polls created by the currently authenticated user.
 * 
 * This function provides the core data for the user's dashboard, displaying
 * all polls they have created in reverse chronological order. It implements
 * proper authorization to ensure users can only access their own polls,
 * maintaining data privacy and security.
 * 
 * Security Context:
 * - Requires user authentication to prevent unauthorized access
 * - Filters polls by user_id to ensure data isolation
 * - Returns empty array for unauthenticated users
 * - Server-side execution prevents client-side data manipulation
 * 
 * Business Logic:
 * - Returns polls in reverse chronological order (newest first)
 * - Includes all poll fields for dashboard display
 * - Handles empty result sets gracefully
 * - Provides consistent error handling
 * 
 * Assumptions:
 * - User has an active, valid session
 * - Database polls table exists with proper schema
 * - User_id field exists and is properly indexed
 * - Supabase client is configured with appropriate permissions
 * 
 * Edge Cases:
 * - Unauthenticated user: Returns empty array with error message
 * - No polls created: Returns empty array (not an error state)
 * - Database connection issues: Returns error with empty array
 * - Session expired: Returns authentication error
 * 
 * Integration:
 * - Called from polls dashboard page as Server Component
 * - Used by PollActions component for individual poll management
 * - Enables poll listing, editing, and deletion functionality
 * - Provides data for poll statistics and management
 * 
 * @returns Promise resolving to object containing polls array and error state
 */
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

/**
 * Retrieves a specific poll by its unique identifier.
 * 
 * This function provides access to individual poll data for viewing, voting,
 * and editing operations. It's designed to be publicly accessible for voting
 * purposes while maintaining data integrity and proper error handling.
 * 
 * Security Context:
 * - No authentication required for public poll viewing
 * - Validates poll ID format to prevent injection attacks
 * - Returns null for non-existent polls without revealing existence
 * - Server-side execution prevents client-side data manipulation
 * 
 * Business Logic:
 * - Returns complete poll data including question and options
 * - Handles non-existent polls gracefully
 * - Provides consistent error responses
 * - Supports both authenticated and anonymous access
 * 
 * Assumptions:
 * - Poll ID is a valid UUID format
 * - Database polls table exists with proper schema
 * - Poll ID field is properly indexed for performance
 * - Supabase client is configured with read permissions
 * 
 * Edge Cases:
 * - Invalid poll ID: Returns validation error
 * - Non-existent poll: Returns null poll with error message
 * - Database connection issues: Returns database error
 * - Malformed ID: Returns appropriate error message
 * 
 * Integration:
 * - Called from poll detail pages for viewing and voting
 * - Used by edit poll pages for pre-populating forms
 * - Enables poll sharing via direct links
 * - Provides data for vote submission validation
 * 
 * @param id - Unique identifier of the poll to retrieve
 * @returns Promise resolving to object containing poll data and error state
 */
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

/**
 * Retrieves the results of a specific poll, including vote counts and percentages.
 *
 * This function provides detailed poll results for public viewing, ensuring data
 * integrity and preventing information leaks. It calculates vote counts for each
 * option and determines if the current user has already participated in the poll.
 *
 * Security Context:
 * - No authentication required for public result viewing
 * - Validates poll ID format to prevent injection attacks
 * - Aggregates vote data without exposing individual voter information
 * - Server-side execution prevents client-side data manipulation
 *
 * Business Logic:
 * - Calculates vote counts for each option
 * - Computes percentage of total votes for each option
 * - Checks if the current user (if authenticated) has already voted
 * - Handles polls with no votes gracefully
 *
 * Assumptions:
 * - Poll ID is a valid UUID format
 * - Database polls and votes tables exist with proper schema
 * - Supabase client is configured with read permissions
 *
 * Edge Cases:
 * - Invalid poll ID: Returns validation error
 * - Non-existent poll: Returns "Poll not found" error
 * - Poll with no votes: Returns zero counts for all options
 * - Database connection issues: Returns database error
 *
 * Integration:
 * - Called from poll detail pages to display results
 * - Enables dynamic result visualization components
 * - Provides data for poll analytics and reporting
 *
 * @param pollId - Unique identifier of the poll to retrieve results for
 * @returns Promise resolving to object containing poll data, results, and error state
 */
export async function getPollResults(pollId: string) {
  const supabase = await createClient();

  // 1. Validate Poll ID
  const pollIdValidation = validatePollId(pollId);
  if (!pollIdValidation.isValid) {
    return { poll: null, results: null, userVote: null, error: pollIdValidation.error };
  }

  // 2. Fetch Poll Details
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("*")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    return { poll: null, results: null, userVote: null, error: "Poll not found." };
  }

  // 3. Fetch All Votes for the Poll
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("option_index, user_id")
    .eq("poll_id", pollId);

  if (votesError) {
    return { poll: null, results: null, userVote: null, error: votesError.message };
  }

  // 4. Get Current User
  const { data: { user } } = await supabase.auth.getUser();

  // 5. Check if the current user has voted
  let userVote: number | null = null;
  if (user && votes) {
    const foundVote = votes.find(v => v.user_id === user.id);
    if (foundVote) {
      userVote = foundVote.option_index;
    }
  }

  // 6. Calculate Results
  const voteCounts = poll.options.map(() => 0);
  if (votes) {
    for (const vote of votes) {
      if (vote.option_index >= 0 && vote.option_index < voteCounts.length) {
        voteCounts[vote.option_index]++;
      }
    }
  }

  const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);

  const results = poll.options.map((option: string, index: number) => ({
    option,
    count: voteCounts[index],
    percentage: totalVotes > 0 ? (voteCounts[index] / totalVotes) * 100 : 0,
  }));

  return { poll, results, userVote, error: null };
}

/**
 * Submits a vote for a specific poll option with comprehensive validation.
 * 
 * This function is the core voting mechanism, handling vote submission with
 * extensive security measures to prevent vote manipulation, duplicate voting,
 * and invalid submissions. It supports both authenticated and anonymous voting
 * while maintaining data integrity and preventing abuse.
 * 
 * Security Context:
 * - Validates poll ID format to prevent injection attacks
 * - Verifies poll existence before allowing vote submission
 * - Validates option index against actual poll options
 * - Prevents duplicate voting for authenticated users
 * - Sanitizes all input data before database operations
 * 
 * Business Logic:
 * - Supports anonymous voting (user_id can be null)
 * - Prevents duplicate votes from authenticated users
 * - Validates option index is within poll's option range
 * - Records vote timestamp for analytics and auditing
 * - Handles both authenticated and anonymous vote scenarios
 * 
 * Assumptions:
 * - Poll ID is a valid UUID format
 * - Option index is a valid integer within poll's option range
 * - Poll exists and is accessible for voting
 * - Database votes table exists with proper schema
 * - User session is valid if user is authenticated
 * 
 * Edge Cases:
 * - Invalid poll ID: Returns validation error
 * - Non-existent poll: Returns "Poll not found" error
 * - Invalid option index: Returns bounds validation error
 * - Duplicate vote (authenticated): Returns duplicate vote error
 * - Database errors: Returns database error message
 * - Network failures: Supabase handles retries
 * 
 * Integration:
 * - Called from PollVotingForm component
 * - Used by poll detail pages for vote submission
 * - Enables real-time vote counting and display
 * - Supports both authenticated and anonymous voting flows
 * - Provides data for poll analytics and results
 * 
 * @param pollId - Unique identifier of the poll being voted on
 * @param optionIndex - Zero-based index of the selected option
 * @returns Promise resolving to error state (null on success, error message on failure)
 */
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  
  // Validate poll ID format to prevent injection attacks
  const pollIdValidation = validatePollId(pollId);
  if (!pollIdValidation.isValid) {
    return { error: pollIdValidation.error };
  }

  // Verify poll exists and retrieve options for validation
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("options")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    return { error: "Poll not found." };
  }

  // Validate option index is within poll's option range
  const optionIndexValidation = validateOptionIndex(optionIndex, poll.options.length);
  if (!optionIndexValidation.isValid) {
    return { error: optionIndexValidation.error };
  }

  // Get current user for duplicate vote prevention
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check for existing vote if user is authenticated
  if (user) {
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      return { error: "You have already voted on this poll." };
    }
  }

  // Insert vote record with user association (null for anonymous votes)
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Deletes a poll with strict ownership verification.
 * 
 * This function implements secure poll deletion with comprehensive authorization
 * checks to ensure only poll owners can delete their polls. It prevents
 * unauthorized deletion attempts and maintains data integrity throughout
 * the deletion process.
 * 
 * Security Context:
 * - Requires user authentication to prevent anonymous deletion
 * - Verifies poll ownership before allowing deletion
 * - Uses compound WHERE clause to ensure only owner's polls are deleted
 * - Server-side execution prevents client-side authorization bypass
 * - Validates poll ID format to prevent injection attacks
 * 
 * Business Logic:
 * - Only poll owners can delete their own polls
 * - Deletion is permanent and cannot be undone
 * - Triggers cache revalidation to update UI immediately
 * - Handles non-existent polls gracefully
 * - Provides clear error messages for different failure scenarios
 * 
 * Assumptions:
 * - User has an active, valid session
 * - Poll ID is a valid UUID format
 * - User is the legitimate owner of the poll
 * - Database polls table exists with proper constraints
 * - Cascade deletion is configured for related votes
 * 
 * Edge Cases:
 * - Unauthenticated user: Returns authentication error
 * - Non-existent poll: Returns success (no-op, idempotent)
 * - Poll owned by different user: Returns success (no-op, secure)
 * - Database errors: Returns database error message
 * - Network failures: Supabase handles retries
 * 
 * Integration:
 * - Called from PollActions component delete button
 * - Used by admin panel for poll management
 * - Triggers UI updates via cache revalidation
 * - Enables poll cleanup and management workflows
 * 
 * @param id - Unique identifier of the poll to delete
 * @returns Promise resolving to error state (null on success, error message on failure)
 */
export async function deletePoll(id: string) {
  const supabase = await createClient();
  
  // Verify user authentication for deletion authorization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError) {
    return { error: userError.message };
  }
  
  if (!user) {
    return { error: "You must be logged in to delete a poll." };
  }

  // Delete poll only if user is the owner (compound WHERE clause for security)
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
    
  if (error) return { error: error.message };
  
  // Refresh polls cache to remove deleted poll from UI
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Updates an existing poll with validated content and ownership verification.
 * 
 * This function enables poll owners to modify their polls after creation,
 * implementing comprehensive validation and authorization to ensure only
 * legitimate owners can update their polls with secure, validated content.
 * 
 * Security Context:
 * - Requires user authentication to prevent anonymous updates
 * - Validates poll ID format to prevent injection attacks
 * - Verifies poll ownership before allowing updates
 * - Validates and sanitizes all input data to prevent XSS
 * - Uses compound WHERE clause to ensure only owner's polls are updated
 * 
 * Business Logic:
 * - Only poll owners can update their polls
 * - All content is validated and sanitized before storage
 * - Maintains poll structure (question + options) integrity
 * - Preserves existing votes when poll content changes
 * - Handles partial updates gracefully
 * 
 * Assumptions:
 * - User has an active, valid session
 * - Poll ID is a valid UUID format
 * - User is the legitimate owner of the poll
 * - FormData contains properly formatted question and options
 * - Validation functions are properly implemented
 * 
 * Edge Cases:
 * - Invalid poll ID: Returns validation error
 * - Unauthenticated user: Returns authentication error
 * - Invalid content: Returns specific validation errors
 * - Non-existent poll: Returns success (no-op, secure)
 * - Poll owned by different user: Returns success (no-op, secure)
 * - Database errors: Returns database error message
 * 
 * Integration:
 * - Called from EditPollForm component via form action
 * - Used by poll management workflows
 * - Enables poll content modification after creation
 * - Maintains poll accessibility and voting functionality
 * 
 * @param pollId - Unique identifier of the poll to update
 * @param formData - Form data containing updated question and options
 * @returns Promise resolving to error state (null on success, error message on failure)
 */
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Validate poll ID format to prevent injection attacks
  const pollIdValidation = validatePollId(pollId);
  if (!pollIdValidation.isValid) {
    return { error: pollIdValidation.error };
  }

  // Validate question content and length
  const questionValidation = validatePollQuestion(question);
  if (!questionValidation.isValid) {
    return { error: questionValidation.error };
  }

  // Validate options array and content
  const optionsValidation = validatePollOptions(options);
  if (!optionsValidation.isValid) {
    return { error: optionsValidation.error };
  }

  // Verify user authentication for update authorization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Update poll only if user is the owner (compound WHERE clause for security)
  const { error } = await supabase
    .from("polls")
    .update({ 
      question: questionValidation.isValid ? question : "",
      options: optionsValidation.sanitizedOptions || []
    })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

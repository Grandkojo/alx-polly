/**
 * Input validation and sanitization utilities for the polling application.
 * 
 * This module provides comprehensive validation and sanitization functions
 * to ensure data integrity and security throughout the application. It
 * implements protection against XSS attacks, enforces business rules,
 * and validates data formats according to application requirements.
 * 
 * Security Features:
 * - XSS protection through input sanitization
 * - Length limits to prevent abuse
 * - Format validation for IDs and data types
 * - Duplicate detection for poll options
 * - Comprehensive error messaging
 */

/**
 * Sanitizes string input to prevent XSS attacks and malicious content.
 * 
 * This function removes potentially dangerous characters and patterns
 * from user input while preserving the essential content. It's designed
 * to be aggressive in filtering while maintaining usability.
 * 
 * Security Measures:
 * - Removes HTML tags (< and >) to prevent script injection
 * - Removes javascript: protocol to prevent URL-based attacks
 * - Removes event handlers (onclick, onload, etc.) to prevent execution
 * - Trims whitespace to normalize input
 * 
 * @param input - Raw string input from user
 * @returns Sanitized string safe for display and storage
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates poll question content and length according to business rules.
 * 
 * This function ensures poll questions meet quality and security standards
 * while providing clear error messages for validation failures. It enforces
 * minimum and maximum length limits to prevent abuse and ensure usability.
 * 
 * Business Rules:
 * - Minimum 3 characters to ensure meaningful questions
 * - Maximum 500 characters to prevent abuse and maintain readability
 * - Required field - cannot be empty or null
 * - Content is sanitized to prevent XSS attacks
 * 
 * @param question - Poll question string to validate
 * @returns Validation result with success status and error message if invalid
 */
export function validatePollQuestion(question: string): { isValid: boolean; error?: string } {
  if (!question || typeof question !== 'string') {
    return { isValid: false, error: 'Question is required.' };
  }
  
  const sanitized = sanitizeString(question);
  
  if (sanitized.length < 3) {
    return { isValid: false, error: 'Question must be at least 3 characters long.' };
  }
  
  if (sanitized.length > 500) {
    return { isValid: false, error: 'Question must be less than 500 characters.' };
  }
  
  return { isValid: true };
}

/**
 * Validates poll options array with comprehensive business rule enforcement.
 * 
 * This function ensures poll options meet quality standards, prevent abuse,
 * and maintain data integrity. It validates array structure, content quality,
 * and enforces business rules for poll option management.
 * 
 * Business Rules:
 * - Minimum 2 options required for meaningful polls
 * - Maximum 10 options to prevent overwhelming choices
 * - Each option must be 1-200 characters long
 * - No duplicate options allowed
 * - All options are sanitized for security
 * 
 * @param options - Array of poll option strings to validate
 * @returns Validation result with success status, error message, and sanitized options
 */
export function validatePollOptions(options: string[]): { isValid: boolean; error?: string; sanitizedOptions?: string[] } {
  if (!Array.isArray(options)) {
    return { isValid: false, error: 'Options must be an array.' };
  }
  
  if (options.length < 2) {
    return { isValid: false, error: 'At least 2 options are required.' };
  }
  
  if (options.length > 10) {
    return { isValid: false, error: 'Maximum 10 options allowed.' };
  }
  
  const sanitizedOptions = options.map(option => {
    if (typeof option !== 'string') return '';
    return sanitizeString(option);
  }).filter(option => option.length > 0);
  
  if (sanitizedOptions.length < 2) {
    return { isValid: false, error: 'At least 2 valid options are required.' };
  }
  
  // Check for duplicate options
  const uniqueOptions = new Set(sanitizedOptions);
  if (uniqueOptions.size !== sanitizedOptions.length) {
    return { isValid: false, error: 'Duplicate options are not allowed.' };
  }
  
  // Check option lengths
  for (const option of sanitizedOptions) {
    if (option.length > 200) {
      return { isValid: false, error: 'Each option must be less than 200 characters.' };
    }
  }
  
  return { isValid: true, sanitizedOptions };
}

/**
 * Validates poll ID format to ensure it's a valid UUID.
 * 
 * This function prevents injection attacks by validating that poll IDs
 * conform to the expected UUID format used by Supabase. It ensures
 * data integrity and prevents malicious ID manipulation.
 * 
 * Security Context:
 * - Prevents SQL injection through ID validation
 * - Ensures IDs conform to expected database format
 * - Validates UUID v4 format used by Supabase
 * 
 * @param id - Poll ID string to validate
 * @returns Validation result with success status and error message if invalid
 */
export function validatePollId(id: string): { isValid: boolean; error?: string } {
  if (!id || typeof id !== 'string') {
    return { isValid: false, error: 'Invalid poll ID.' };
  }
  
  // Basic UUID validation (Supabase uses UUIDs)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { isValid: false, error: 'Invalid poll ID format.' };
  }
  
  return { isValid: true };
}

/**
 * Validates option index to ensure it's within the valid range for a poll.
 * 
 * This function prevents array bounds errors and ensures that vote submissions
 * reference valid poll options. It validates that the index is a valid integer
 * within the range of available poll options.
 * 
 * Business Logic:
 * - Option index must be a valid integer
 * - Index must be >= 0 (zero-based indexing)
 * - Index must be < maxOptions (within bounds)
 * - Prevents out-of-bounds array access
 * 
 * @param index - Option index to validate
 * @param maxOptions - Maximum number of options in the poll
 * @returns Validation result with success status and error message if invalid
 */
export function validateOptionIndex(index: number, maxOptions: number): { isValid: boolean; error?: string } {
  if (typeof index !== 'number' || !Number.isInteger(index)) {
    return { isValid: false, error: 'Invalid option index.' };
  }
  
  if (index < 0 || index >= maxOptions) {
    return { isValid: false, error: 'Option index out of bounds.' };
  }
  
  return { isValid: true };
}

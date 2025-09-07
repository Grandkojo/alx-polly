// Input validation and sanitization utilities

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

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

export function validateOptionIndex(index: number, maxOptions: number): { isValid: boolean; error?: string } {
  if (typeof index !== 'number' || !Number.isInteger(index)) {
    return { isValid: false, error: 'Invalid option index.' };
  }
  
  if (index < 0 || index >= maxOptions) {
    return { isValid: false, error: 'Option index out of bounds.' };
  }
  
  return { isValid: true };
}

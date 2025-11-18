/**
 * Schema availability checker
 * Detects if Supabase schema is set up and caches the result
 * to avoid repeated failed requests
 */

let schemaAvailable: boolean | null = null; // null = not checked yet, true/false = checked
let checkInProgress = false;

/**
 * Check if Supabase schema is available
 * Returns true if schema is available, false if not, or null if not checked yet
 */
export function isSchemaAvailable(): boolean | null {
  return schemaAvailable;
}

/**
 * Mark schema as unavailable (called when we get PGRST106 error)
 */
export function markSchemaUnavailable(): void {
  schemaAvailable = false;
}

/**
 * Mark schema as available (called when we successfully fetch data)
 */
export function markSchemaAvailable(): void {
  schemaAvailable = true;
}

/**
 * Check if we should skip Supabase requests
 * Returns true if we should skip (schema not available), false if we should try
 */
export function shouldSkipSupabase(): boolean {
  // If we've already determined schema is unavailable, skip
  if (schemaAvailable === false) {
    return true;
  }
  // If not checked yet or available, don't skip
  return false;
}

/**
 * Reset schema check (useful for testing or after schema setup)
 */
export function resetSchemaCheck(): void {
  schemaAvailable = null;
  checkInProgress = false;
}


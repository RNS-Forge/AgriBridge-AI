// ---------------------------------------------------------------------------
// Shared utility functions.
// All pure helpers live here so features never duplicate logic.
// ---------------------------------------------------------------------------

/**
 * Truncate a UUID to its first N characters for display.
 * e.g.  truncateId('abc-def-...', 8) → 'abc-def-'
 */
export function truncateId(id: string, length = 8): string {
  return id.slice(0, length);
}

/**
 * Format a date string into a human-readable locale string.
 * Defaults to the user's browser locale.
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Return the initials of a full name (up to 2 letters).
 * e.g. getInitials('Rajesh', 'Sharma') → 'RS'
 */
export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalise(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Safely parse JSON from localStorage.
 * Returns null if the key is missing or the value is invalid JSON.
 */
export function parseLocalStorageJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

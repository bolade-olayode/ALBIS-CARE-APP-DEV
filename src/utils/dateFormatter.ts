// src/utils/dateFormatter.ts

/**
 * Converts Database Date (YYYY-MM-DD) to UK Display Date (DD-MM-YYYY)
 * Example: 2024-12-25 -> 25-12-2024
 */
export const formatDate = (isoDate: string | undefined | null): string => {
  if (!isoDate) return '';
  
  // Safety Check: If it's already DD-MM-YYYY, don't change it
  if (isoDate.includes('-') && isoDate.split('-')[0].length === 2) return isoDate;
  
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate; // Return original if invalid
  
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};

/**
 * Converts User Input (DD-MM-YYYY) back to Database Date (YYYY-MM-DD)
 * Example: 25-12-2024 -> 2024-12-25
 */
export const parseDate = (displayDate: string): string => {
  if (!displayDate) return '';
  
  // Safety Check: If it's already YYYY-MM-DD, don't change it
  if (displayDate.includes('-') && displayDate.split('-')[0].length === 4) return displayDate;

  const parts = displayDate.split('-');
  if (parts.length !== 3) return displayDate; // Return original if invalid

  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};
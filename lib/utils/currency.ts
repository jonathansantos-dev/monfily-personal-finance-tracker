/**
 * Currency utility functions for converting between cents (storage) and dollars (display).
 * All monetary values are stored as integers (cents) to avoid floating point issues.
 */

/**
 * Converts a cent value to its dollar equivalent.
 * @param cents - The amount in cents (integer).
 * @returns The amount in dollars.
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Converts a dollar value to its cent equivalent, rounding to the nearest integer.
 * @param dollars - The amount in dollars.
 * @returns The amount in cents (integer).
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Formats a cent value as a USD currency string (e.g., "$1,234.56").
 * Uses Intl.NumberFormat for locale-aware formatting with comma-separated thousands
 * and exactly 2 decimal places.
 * @param cents - The amount in cents (integer).
 * @returns Formatted currency string in USD.
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Parses a currency input string (e.g., "$1,234.56") and returns the value in cents.
 * Strips dollar signs and commas before parsing.
 * @param input - A string representing a dollar amount (may include $ and commas).
 * @returns The amount in cents (integer).
 * @throws Error if the input cannot be parsed as a valid number.
 */
export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[$,]/g, '');
  const dollars = parseFloat(cleaned);
  if (isNaN(dollars)) throw new Error('Invalid currency input');
  return Math.round(dollars * 100);
}

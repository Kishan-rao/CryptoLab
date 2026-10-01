/**
 * Formatting and helper utilities for cryptographic visualization.
 */

export function formatHexWithSpaces(hexStr, chunkSize = 2) {
  if (!hexStr) return '';
  const clean = hexStr.replace(/\s+/g, '');
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  const chunks = clean.match(regex);
  return chunks ? chunks.join(' ') : clean;
}

export function cleanHex(input) {
  if (!input) return '';
  return input.trim().replace(/\s+/g, '').replace(/^0x/i, '').toLowerCase();
}

export function isValidHex(hexStr, expectedLength = null) {
  const clean = cleanHex(hexStr);
  if (expectedLength !== null && clean.length !== expectedLength) {
    return false;
  }
  return /^[0-9a-fA-F]*$/.test(clean);
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Cross-device unlock log via a dedicated Google Form → Sheet.
 *
 * Write: POST year + name to the form (same pattern as feedback).
 * Read:  fetch the published response sheet as CSV.
 *
 * Setup (one-time): see README "Unlock log (Google Sheet)".
 */

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const UNLOCK_FORM_ACTION =
  env.VITE_UNLOCK_FORM_ACTION ||
  'https://docs.google.com/forms/d/e/1FAIpQLSeXmL3Xu_ExfeLwFA7MfQHKc5l1XwUcnqJj3yUnDR4oLQt6cw/formResponse';

export const UNLOCK_ENTRY_YEAR = env.VITE_UNLOCK_ENTRY_YEAR || '175874590';
export const UNLOCK_ENTRY_NAME = env.VITE_UNLOCK_ENTRY_NAME || '2038793576';

/** Response sheet CSV (Anyone with the link → Viewer). */
export const UNLOCK_SHEET_CSV =
  env.VITE_UNLOCK_SHEET_CSV ||
  'https://docs.google.com/spreadsheets/d/1DL2SpsAnwDelftEvWsAv7rEvW4eV_jTR5WexPeJMPV4/export?format=csv&gid=1256457626';

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase();
}

export function unlockKey(year, name) {
  return `${year}::${normalizeName(name)}`;
}

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

function headerIndex(headers, candidates) {
  const normalized = headers.map((header) => header.trim().toLowerCase());
  for (const candidate of candidates) {
    const index = normalized.indexOf(candidate);
    if (index >= 0) return index;
  }
  return -1;
}

/** Parse Sheet CSV into a Set of `${year}::${name}` keys. */
export function keysFromCsv(text) {
  const lines = String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2) return new Set();

  const headers = parseCsvLine(lines[0]);
  const yearIdx = headerIndex(headers, ['year', 'boot camp year', 'camp year']);
  const nameIdx = headerIndex(headers, ['name', 'full name', 'participant name']);
  if (yearIdx < 0 || nameIdx < 0) return new Set();

  const keys = new Set();
  for (let i = 1; i < lines.length; i += 1) {
    const cells = parseCsvLine(lines[i]);
    const year = Number(String(cells[yearIdx] || '').trim());
    const name = cells[nameIdx];
    if (!Number.isFinite(year) || !normalizeName(name)) continue;
    keys.add(unlockKey(year, name));
  }
  return keys;
}

export async function fetchRemoteUnlockKeys() {
  if (!UNLOCK_SHEET_CSV) return new Set();
  try {
    const response = await fetch(UNLOCK_SHEET_CSV, { cache: 'no-store' });
    if (!response.ok) return new Set();
    return keysFromCsv(await response.text());
  } catch {
    return new Set();
  }
}

export function isUnlockLogConfigured() {
  return Boolean(UNLOCK_FORM_ACTION && UNLOCK_ENTRY_YEAR && UNLOCK_ENTRY_NAME);
}

/** Fire-and-forget posts; uses no-cors like the feedback form. */
export async function submitUnlocks(records) {
  if (!isUnlockLogConfigured() || !records?.length) return;

  const seen = new Set();
  const posts = [];
  for (const record of records) {
    const year = String(record.year ?? '').trim();
    const name = String(record.name || '').trim();
    if (!year || !name) continue;
    const key = unlockKey(year, name);
    if (seen.has(key)) continue;
    seen.add(key);

    const body = new URLSearchParams();
    body.set(`entry.${UNLOCK_ENTRY_YEAR}`, year);
    body.set(`entry.${UNLOCK_ENTRY_NAME}`, name);
    body.set('fvv', '1');
    body.set('pageHistory', '0');
    body.set('fbzx', String(-Math.floor(Math.random() * 9e18)));
    body.set('submissionTimestamp', String(Date.now()));

    posts.push(
      fetch(UNLOCK_FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      }).catch(() => null)
    );
  }

  await Promise.all(posts);
}

const STORAGE_KEY = 'dcit-camp-certificate-unlocks';

function recordKey(record) {
  return `${record.year}::${record.name.toLowerCase()}`;
}

function readKeys() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function areUnlocked(records) {
  if (!records.length) return false;
  const keys = readKeys();
  return records.every((record) => keys.includes(recordKey(record)));
}

export function unlock(records) {
  try {
    const keys = new Set(readKeys());
    for (const record of records) keys.add(recordKey(record));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys]));
  } catch {
    // A blocked or full localStorage only costs the participant a repeat survey.
  }
}

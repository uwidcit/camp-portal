import { unlockKey } from './unlockLog';

const STORAGE_KEY = 'dcit-camp-certificate-unlocks';

function recordKey(record) {
  return unlockKey(record.year, record.name);
}

function readKeys() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function areUnlocked(records, remoteKeys = null) {
  if (!records.length) return false;
  const local = readKeys();
  const remote = remoteKeys instanceof Set ? remoteKeys : null;
  return records.every(
    (record) =>
      Boolean(record.collected) ||
      local.includes(recordKey(record)) ||
      (remote !== null && remote.has(recordKey(record)))
  );
}

export function unlock(records) {
  try {
    const keys = new Set(readKeys());
    for (const record of records) keys.add(recordKey(record));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys]));
  } catch {
    // A blocked or full localStorage only costs a repeat survey on this device
    // unless the remote Sheet log already has the row.
  }
}

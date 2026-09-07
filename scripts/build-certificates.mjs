import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'data', 'raw', 'certificates.private.json');
const collectedPath = path.join(root, 'data', 'raw', 'collected.json');
const outputPath = path.join(root, 'public', 'data', 'certificates.json');

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function normalizeName(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectedKey(year, name) {
  return `${year}::${normalizeName(name).toLowerCase()}`;
}

function encryptSecret(plaintext, email) {
  const key = createHash('sha256').update(normalizeEmail(email)).digest();
  const data = Buffer.from(plaintext, 'utf8');
  const output = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 1) {
    output[i] = data[i] ^ key[i % key.length];
  }
  return output.toString('base64');
}

async function readCollectedKeys() {
  try {
    const payload = JSON.parse(await readFile(collectedPath, 'utf8'));
    const keys = new Set();
    for (const entry of payload.records || []) {
      if (!entry?.year || !entry?.name) continue;
      keys.add(collectedKey(entry.year, entry.name));
    }
    return keys;
  } catch (error) {
    if (error && error.code === 'ENOENT') return new Set();
    throw error;
  }
}

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const collected = await readCollectedKeys();
const records = [];

for (const entry of source.records) {
  const name = normalizeName(entry.name);
  const emails = [...new Set((entry.emails || []).map(normalizeEmail).filter(Boolean))];
  if (!name || emails.length === 0) continue;

  const url = String(entry.url || '').trim();
  const payload = url || 'pending';
  const secrets = [...new Set(emails.map((email) => encryptSecret(payload, email)))];

  records.push({
    year: entry.year,
    camp: entry.camp,
    name,
    collected: collected.has(collectedKey(entry.year, name)),
    secrets
  });
}

records.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString().slice(0, 10),
      privacy:
        'Emails are not stored. Certificate URLs are encrypted with the registration email. collected means they already unlocked via this app (survey done), not merely that a cert was issued.',
      records
    },
    null,
    2
  )}\n`
);

const collectedCount = records.filter((record) => record.collected).length;
console.log(
  `Wrote ${records.length} certificate lookup records (${collectedCount} already collected) to public/data/certificates.json`
);

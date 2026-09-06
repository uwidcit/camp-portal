import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { emailVariants, nameScore, normalizeEmail } from '../src/lib/fuzzy.js';

const root = path.resolve(import.meta.dirname, '..');
const privateRecords = JSON.parse(await readFile(path.join(root, 'data', 'raw', 'certificates.private.json'), 'utf8')).records;
const publicIndex = JSON.parse(await readFile(path.join(root, 'public', 'data', 'certificates.json'), 'utf8')).records;

function decrypt(ciphertext, email) {
  if (!ciphertext) return null;
  const key = createHash('sha256').update(normalizeEmail(email)).digest();
  const data = Buffer.from(ciphertext, 'base64');
  const output = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 1) output[i] = data[i] ^ key[i % key.length];
  const text = output.toString('utf8');
  if (text === 'pending') return '';
  if (text.startsWith('https://') || text.startsWith('http://')) return text;
  return null;
}

const sample = privateRecords.find((row) => row.url && row.emails[0] && row.name.includes(' '));
if (!sample) throw new Error('No sample record with a certificate URL');

const publicRecord = publicIndex.find((row) => row.year === sample.year && row.name === sample.name);
if (!publicRecord) throw new Error('Public index is missing the sample record');

const typoName = sample.name.slice(0, -1);
const casedEmail = sample.emails[0].toUpperCase();
const misspelledEmail = `${sample.emails[0].slice(0, 3)}x${sample.emails[0].slice(4)}`;

const score = nameScore(typoName, sample.name);
if (score < 0.74) throw new Error(`Expected typo name to fuzzy-match, got ${score}`);

const variants = emailVariants(misspelledEmail);
if (!variants.includes(normalizeEmail(sample.emails[0])) && !variants.includes(normalizeEmail(casedEmail))) {
  const hit = variants.some((variant) => decrypt(publicRecord.secrets[0], variant) !== null);
  if (!hit) throw new Error('Expected edit-distance email variant to decrypt a secret');
}

let decrypted = null;
for (const variant of emailVariants(casedEmail)) {
  for (const secret of publicRecord.secrets) {
    decrypted = decrypt(secret, variant);
    if (decrypted !== null) break;
  }
  if (decrypted !== null) break;
}

if (decrypted !== sample.url) {
  throw new Error('Decrypted URL did not match the private source URL');
}

const withCerts = publicIndex.filter((row) => row.secrets.some(Boolean)).length;
console.log(`Lookup checks passed for ${publicIndex.length} indexed records (${withCerts} with stored secrets).`);

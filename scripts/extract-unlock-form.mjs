/**
 * Extract formResponse URL + Year/Name entry IDs from a published unlock form.
 *
 * Usage:
 *   node scripts/extract-unlock-form.mjs "https://docs.google.com/forms/d/e/.../viewform"
 */

const url = process.argv[2];
if (!url || !url.includes('docs.google.com/forms')) {
  console.error('Pass the published viewform URL (Send → link).');
  process.exit(1);
}

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Could not load form (${response.status}). Is it published?`);
}

const html = await response.text();
const actionMatch = html.match(/action="(https:\/\/docs\.google\.com\/forms\/d\/e\/[^"]+\/formResponse)"/);
const dataMatch = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]*?);\s*<\/script>/);

if (!actionMatch || !dataMatch) {
  throw new Error('Could not find FB_PUBLIC_LOAD_DATA_ / formResponse in the page HTML.');
}

const action = actionMatch[1].replace(/&amp;/g, '&');
const data = JSON.parse(dataMatch[1]);
const questions = data?.[1]?.[1] || [];

const found = [];
for (const question of questions) {
  const title = String(question?.[1] || '').trim();
  const entry = question?.[4]?.[0]?.[0];
  if (entry == null) continue;
  found.push({ title, entry: String(entry) });
}

const year = found.find((item) => /year/i.test(item.title));
const name = found.find((item) => /name/i.test(item.title));

console.log('Form action:');
console.log(`  ${action}`);
console.log('\nQuestions:');
for (const item of found) {
  console.log(`  ${item.title} → entry.${item.entry}`);
}

if (!year || !name) {
  console.error('\nExpected short-answer questions titled roughly "Year" and "Name".');
  process.exit(1);
}

console.log('\nPaste into src/lib/unlockLog.js (or .env):');
console.log(`UNLOCK_FORM_ACTION = '${action}'`);
console.log(`UNLOCK_ENTRY_YEAR  = '${year.entry}'`);
console.log(`UNLOCK_ENTRY_NAME  = '${name.entry}'`);

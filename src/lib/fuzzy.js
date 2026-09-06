export function normalizeName(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function normalizeEmail(value) {
  return String(value || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array(b.length + 1);
  const next = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    next[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      next[j] = Math.min(prev[j] + 1, next[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = next[j];
  }

  return prev[b.length];
}

export function similarity(a, b) {
  const left = String(a || '');
  const right = String(b || '');
  if (!left && !right) return 1;
  if (!left || !right) return 0;
  return 1 - levenshtein(left, right) / Math.max(left.length, right.length);
}

function tokens(value) {
  return normalizeName(value).split(' ').filter(Boolean);
}

export function nameScore(query, recordName) {
  const q = normalizeName(query);
  const n = normalizeName(recordName);
  if (!q || !n) return 0;
  if (q === n) return 1;

  const qTokens = tokens(query);
  const nTokens = tokens(recordName);
  const reversed = [...qTokens].reverse().join(' ');
  const full = Math.max(similarity(q, n), similarity(reversed, n));

  let tokenHits = 0;
  for (const token of qTokens) {
    let best = 0;
    for (const other of nTokens) {
      best = Math.max(best, similarity(token, other));
    }
    if (best >= 0.78) tokenHits += 1;
  }
  const coverage = qTokens.length ? tokenHits / qTokens.length : 0;

  const qLast = qTokens[qTokens.length - 1] || '';
  const nLast = nTokens[nTokens.length - 1] || '';
  const lastScore = similarity(qLast, nLast);
  const qFirst = qTokens[0] || '';
  const nFirst = nTokens[0] || '';
  const firstScore = Math.max(
    similarity(qFirst, nFirst),
    ...nTokens.map((token) => similarity(qFirst, token))
  );

  return Math.max(full, coverage * 0.86 + lastScore * 0.14, firstScore * 0.45 + lastScore * 0.55);
}

const DOMAIN_FIXES = [
  [/gamil\.com$/, 'gmail.com'],
  [/gmial\.com$/, 'gmail.com'],
  [/gmal\.com$/, 'gmail.com'],
  [/gmail\.con$/, 'gmail.com'],
  [/googlemail\.com$/, 'gmail.com'],
  [/yahooo\.com$/, 'yahoo.com'],
  [/yahoo\.con$/, 'yahoo.com'],
  [/hotmial\.com$/, 'hotmail.com'],
  [/hotmail\.con$/, 'hotmail.com'],
  [/outlok\.com$/, 'outlook.com'],
  [/outlook\.con$/, 'outlook.com'],
  [/\.con$/, '.com']
];

export function emailVariants(value) {
  const base = normalizeEmail(value);
  const variants = new Set([base]);
  if (!base) return [];

  for (const [pattern, replacement] of DOMAIN_FIXES) {
    if (pattern.test(base)) variants.add(base.replace(pattern, replacement));
  }

  const at = base.lastIndexOf('@');
  if (at > 0) {
    const local = base.slice(0, at);
    const domain = base.slice(at + 1);
    variants.add(`${local.replace(/\./g, '')}@${domain}`);
    variants.add(`${local.replace(/[._+-]/g, '')}@${domain}`);
  }

  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789.@_+-';
  for (let i = 0; i < base.length; i += 1) {
    variants.add(base.slice(0, i) + base.slice(i + 1));
    if (i < base.length - 1) {
      variants.add(base.slice(0, i) + base[i + 1] + base[i] + base.slice(i + 2));
    }
    for (const character of alphabet) {
      if (character !== base[i]) {
        variants.add(base.slice(0, i) + character + base.slice(i + 1));
      }
    }
  }

  return [...variants];
}

export const NAME_MATCH_THRESHOLD = 0.74;

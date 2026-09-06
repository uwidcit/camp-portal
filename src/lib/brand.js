// Sampled from each year's enrolment flyer on sta.uwi.edu/fst/dcit/bootcamp:
// `brand` is the flyer's headline and side-tab colour, `accent` its secondary highlight.
const PALETTES = {
  2026: { brand: '#1f86b8', deep: '#0d4a68', accent: '#eda812' }, // blue headings, amber cost
  2025: { brand: '#8f1114', deep: '#5e0a0c', accent: '#d75f0c' }, // maroon headings, orange dates
  2024: { brand: '#16218c', deep: '#0c1560', accent: '#1f9fc9' }, // navy headings, cyan topics
  2023: { brand: '#cf2c5f', deep: '#8c0b30', accent: '#2099d0' }, // crimson headings, cyan dates
  2022: { brand: '#cf5c0c', deep: '#8f3c07', accent: '#0286a9' }, // orange headings, teal cost
  2021: { brand: '#0b3c8b', deep: '#062a63', accent: '#e3b306' } // navy headings, gold shields
};

// Years without a hand-picked palette get a stable hue from a golden-angle walk,
// so a new edition looks deliberate before anyone sets its colours here.
export function paletteFor(year) {
  const known = PALETTES[year];
  if (known) return known;
  const hue = Math.round((Number(year) * 137.508) % 360);
  return {
    brand: `hsl(${hue} 58% 38%)`,
    deep: `hsl(${hue} 62% 26%)`,
    accent: `hsl(${(hue + 184) % 360} 68% 44%)`
  };
}

export function latestPalette() {
  const years = Object.keys(PALETTES).map(Number);
  return PALETTES[Math.max(...years)];
}

export function applyPalette(palette) {
  const root = document.documentElement;
  root.style.setProperty('--brand', palette.brand);
  root.style.setProperty('--brand-deep', palette.deep);
  root.style.setProperty('--accent', palette.accent);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', palette.deep);
}

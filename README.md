# DCIT Boot Camp Portal

React/Vite portal for showcasing DCIT Boot Camp yearly statistics, teams, projects, sponsors, prize winners, and gallery status.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

The app is configured for a repository named `camp-portal` with Vite `base: '/camp-portal/'`.
Build output goes to **`docs/`** so GitHub Pages can serve from that folder.

```bash
npm run build
```

In the repository settings, set Pages source to **Deploy from a branch**, branch `main`, folder **`/docs`**. Commit the `docs/` folder after each production build.

Live site: https://uwidcit.github.io/camp-portal/

## Design and per-year branding

The UI follows the boot camp flyer: white paper sheet over a hexagon field, sharp corners,
hairline rules, rotated section tabs, a poster-scale year numeral, and an ink/accent colour pair.

Each edition has its own colour, defined in `src/lib/brand.js`:

```js
2026: { brand: '#1f86b8', deep: '#0d4a68', accent: '#eda812' },
```

`brand` drives rules, tabs, and headings; `accent` drives the year numeral, bullets, and CTA outlines.
Selecting a year sets these as CSS custom properties on `<html>`, so the whole page re-brands.

The palettes are sampled from each year's enrolment flyer on the departmental site, taking `brand`
from the flyer's headline and side-tab colour and `accent` from its secondary highlight:

| Year | Flyer identity |
| --- | --- |
| 2026 | Blue headings, amber cost |
| 2025 | Maroon headings, orange dates |
| 2024 | Navy headings, cyan topics |
| 2023 | Crimson headings, cyan dates |
| 2022 | Orange headings, teal cost |
| 2021 | Navy headings, gold padlocks |

Years without an entry fall back to a generated hue, so a new edition still looks deliberate —
add its palette here once that year's flyer exists.

## Certificate lookup

Participants can retrieve a certificate from an unlisted page, not linked in the portal UI:

```text
https://uwidcit.github.io/camp-portal/certificate.html
```

The form accepts a name and email. Matching is case-insensitive and allows close misspellings. A guardian email works when that is what was registered. Emails are not stored in the public data; certificate URLs are encrypted with the registration email.

Rebuild the public index after updating `data/raw/certificates.private.json`:

```bash
npm run certs
```

## Feedback gate

A matched participant sees the feedback survey instead of a download link. Submitting it unlocks the certificate and records the unlock in `localStorage`, so the survey is asked once per device.

The survey is a native React rendering of the Boot Camp Feedback Google Form. It posts directly to that form's public `formResponse` endpoint, so answers land in the same Google response sheet as the original form. Responses are anonymous and carry no link to the participant's name, email or certificate.

The question list, field IDs and exact option strings live in `src/lib/feedbackForm.js`. Option `value` must match Google's stored text exactly; `label` is what participants see, which is how the "Whis it was shorter" typo is displayed correctly without breaking the data.

Because the site is static, the gate is enforced in the browser only. It holds for ordinary participants but can be bypassed by anyone using developer tools.

Verify the payload after editing the form spec:

```bash
node scripts/test-feedback-submit.mjs          # builds and validates the payload only
node scripts/test-feedback-submit.mjs --send   # posts a real response; delete it afterwards
```

If the Google Form is edited (questions added, removed or reordered), re-extract the field IDs from `FB_PUBLIC_LOAD_DATA_` in the published form's HTML and update `src/lib/feedbackForm.js`.

## Data

Public-safe data lives in `public/data/bootcamps.json` and is fetched by the UI at runtime from:

```text
/camp-portal/data/bootcamps.json
```

Each camp carries an `edition` object describing that year's theme, sourced from the departmental
boot camp pages under https://sta.uwi.edu/fst/dcit/bootcamp:

```json
"edition": {
  "officialTitle": "DCIT AI-Builders Boot Camp 2026",
  "track": "AI Builders",
  "theme": "Empowering Tomorrow’s Innovators: From Curiosity to Creation with AI",
  "dates": "July 20–27, 2026",
  "audience": "Secondary school Forms 4, 5 and 6",
  "format": "Five days online plus a face-to-face showcase",
  "partners": ["T&T Women in Data Science (WiDS)"],
  "summary": "Short prose blurb shown above the specs.",
  "topics": ["Intelligent web apps"],
  "stack": ["OpenAI SDKs"],
  "source": "https://sta.uwi.edu/fst/dcit/bootcamp/2026/home"
}
```

`track` drives the kicker, the section heading, and the year-tab tooltip. Every field is optional:
the Focus block renders only what is present, and disappears entirely if the object is missing.
The tracks so far are AI Builders (2025, 2026), Innovations in Data Science with WiDS (2024),
Web Development (2022, 2023), and Cyber Security Concepts with ISACA (2021).

Sponsors come from the `Scholarships` table of each year's Airtable base, where the `Sponsor`
field names the company; `scholarships` on each sponsor is the number of awards tagged to it.

### Participant feedback

Each camp also carries a `feedback` object that drives the Voices block:

```json
"feedback": {
  "responseCount": 13,
  "satisfaction": 4.5,
  "recommend": 8.9,
  "nps": 69,
  "confidence": { "label": "More confident building with AI", "value": 4.8 },
  "wishLonger": 4,
  "quotes": [{ "prompt": "Final comments", "text": "…" }]
}
```

`satisfaction` and `confidence.value` are out of 5, `recommend` is out of 10, and `nps` is the
standard net promoter score computed from `recommend` (promoters 9–10 minus detractors 0–6).
`wishLonger` counts responses that answered "Wish it was longer" to the duration question — the
most consistent request across every edition. Every field is optional, and the block only renders
the metrics it has.

Numbers are averaged from the raw per-year response sheets in Drive (`BOOT CAMP <year> Feedback
Form (Responses)`), not from the aggregated master sheet, which carries generated sample rows.
Test rows submitted by `scripts/test-feedback-submit.mjs` are excluded. Quotes are verbatim
participant comments trimmed at sentence boundaries and published anonymously, attributed only to
the year and the question they answered.

| Year | Responses | Satisfaction | Recommend | NPS | Wanted longer |
| ---- | --------- | ------------ | --------- | --- | ------------- |
| 2026 | 13        | 4.5 / 5      | 8.9 / 10  | +69 | 4             |
| 2025 | 20        | 4.0 / 5      | 8.0 / 10  | +35 | 7             |
| 2024 | 18        | 4.3 / 5      | 8.0 / 10  | +17 | 5             |
| 2023 | 23        | 4.5 / 5      | 9.0 / 10  | +70 | 16            |
| 2022 | 21        | 4.4 / 5      | 8.6 / 10  | +48 | 11            |
| 2021 | 20        | 4.0 / 5      | 8.1 / 10  | +30 | 8             |

The 2024 form asked the confidence question about web apps rather than data science, so that year
reports no confidence score.

Private Airtable/Drive exports are intentionally ignored by git:

- `bootcamp-portal-data.json`
- `data/raw/`
- `*.raw.json`
- `*.private.json`
- `*.sensitive.json`

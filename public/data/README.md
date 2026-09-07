# Public Data

This folder contains JSON that is committed with the repo and deployed with the GitHub Pages site.

## Files

- `bootcamps.json` - public-safe portal data for yearly camps, teams, projects, sponsors, prizes, and stats.
- `certificates.json` - unlisted certificate lookup index. Names and years only; emails are not included. Certificate URLs are stored encrypted. `collected: true` is an optional build-time skip flag. Live unlocks also go to a published Google Sheet read at lookup time.

## Rules

Do not include private Airtable or Google Drive fields here:

- guardian names
- guardian emails
- participant emails
- phone numbers
- payment proofs
- receipt/reference numbers
- private notes
- dates of birth
- raw certificate files

Raw/private exports should stay in ignored paths such as `data/raw/` or `*.private.json`.

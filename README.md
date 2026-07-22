# Central Texas Property Tax Calculator

A what-if property tax estimator for six Central Texas counties: Bexar, Blanco, Comal,
Guadalupe, Hays, and Kendall.

- `frontend/` — React (Vite) single-page app. All tax math and the print-friendly report live
  here (`src/lib/taxCalc.js`).
- `backend/` — Node/Express API that drives a Playwright-controlled browser to search public
  appraisal district portals.

## Current status

- The calculator itself (market value, exemptions, per-taxing-unit rates, current-vs-what-if
  comparison, print report) is fully working with manually entered or edited data.
- Automated lookup is implemented for **Bexar County** only (`esearch.bcad.org`), with the other
  five counties returning a clear "not implemented yet" response. The BCAD scraper could not be
  verified against the live site from the sandbox this was built in — outbound network access
  there is restricted to an allowlist that does not include `esearch.bcad.org`. Its selectors
  should be checked against the live DOM the first time it runs somewhere with normal internet
  access, per the note in `backend/src/scrapers/bcad.js`.
- If a lookup fails or isn't supported for a county, the UI offers "Enter Manually" so the
  calculator is always usable.

## Running locally

Requires Node.js 18+.

```bash
# Backend (API + scraper)
cd backend
npm install
npx playwright install chromium   # one-time, downloads a browser for Playwright
npm start                         # http://127.0.0.1:8787

# Frontend (in a second terminal)
cd frontend
npm install
npm run dev                       # http://127.0.0.1:5173
```

Open the frontend URL, pick a county, and either search an address or choose "Skip Lookup —
Enter Manually" to build an estimate from your own numbers.

## Calculation rules implemented

See `frontend/src/lib/taxCalc.js`:

- $140,000 general school-district homestead exemption; an additional $60,000 for a qualifying
  owner who is age 65+ or disabled (alternatives, not stacked).
- Disabled veteran partial exemptions: $5,000 / $7,500 / $10,000 / $12,000 by rating tier, or
  $12,000 flat if the veteran is also 65+.
- The 100% disabled / individual-unemployability option zeroes out taxable value for the
  estimate.
- Over-65 and disabled tax ceilings, freezes, and transfers are **not** calculated — this is a
  first-version scope limit, so a qualifying owner's real bill may be lower than the estimate.
- Local exemption amounts (homestead $/%, over-65/disabled $) are editable per taxing unit so you
  can carry forward whatever a portal or record exposes.

import { chromium } from 'playwright';

// All six counties' appraisal districts run on the same "eSearch" portal software, just on
// different subdomains, so one scraper covers all of them. Field names/selectors are unverified
// against any of the live sites from this environment (outbound browser downloads and fetches to
// these hosts were both blocked here). Treat this as a best-effort implementation to be corrected
// against the real DOM the first time it runs somewhere with network access to these portals.
export function makeEsearchLookup(baseUrl) {
  return async function lookup({ address, zip }) {
    const browser = await chromium.launch({
      headless: true,
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    });
    try {
      const page = await browser.newPage();
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

      await page.getByRole('tab', { name: /address/i }).click();
      await page.getByRole('textbox', { name: /address/i }).fill(address);
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle', { timeout: 20000 });

      const houseNumber = address.trim().split(/\s+/)[0];
      const resultLink = page
        .locator('a', { hasText: zip })
        .filter({ hasText: houseNumber })
        .first();
      if (await resultLink.count()) {
        await resultLink.click();
        await page.waitForLoadState('networkidle', { timeout: 20000 });
      } else {
        throw new Error(`No result matched both house number "${houseNumber}" and ZIP "${zip}".`);
      }

      const marketValueText = await page
        .getByText(/market value/i)
        .locator('xpath=following::*[1]')
        .first()
        .textContent()
        .catch(() => null);

      const marketValue = marketValueText ? Number(marketValueText.replace(/[^0-9.]/g, '')) : NaN;

      if (!Number.isFinite(marketValue) || marketValue <= 0) {
        throw new Error('Could not parse a market value from the results page.');
      }

      const yearText = await page
        .getByText(/(tax|appraisal) year/i)
        .locator('xpath=following::*[1]')
        .first()
        .textContent()
        .catch(() => null);
      const parsedYear = yearText ? Number(yearText.replace(/[^0-9]/g, '')) : NaN;

      const preliminary = await page
        .getByText(/preliminary|work[- ]?in[- ]?progress/i)
        .count()
        .then((count) => count > 0)
        .catch(() => false);

      return {
        year: Number.isFinite(parsedYear) && parsedYear > 2000 ? parsedYear : new Date().getFullYear(),
        preliminary,
        marketValue,
        taxingUnits: [],
      };
    } finally {
      await browser.close();
    }
  };
}

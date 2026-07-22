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

      const resultLink = page.locator('a', { hasText: zip }).first();
      if (await resultLink.count()) {
        await resultLink.click();
        await page.waitForLoadState('networkidle', { timeout: 20000 });
      }

      const marketValueText = await page
        .getByText(/market value/i)
        .locator('xpath=following::*[1]')
        .first()
        .textContent()
        .catch(() => null);

      if (!marketValueText) {
        throw new Error('Could not locate property record on the results page.');
      }

      const marketValue = Number(marketValueText.replace(/[^0-9.]/g, ''));

      return {
        year: new Date().getFullYear(),
        preliminary: false,
        marketValue,
        taxingUnits: [],
      };
    } finally {
      await browser.close();
    }
  };
}

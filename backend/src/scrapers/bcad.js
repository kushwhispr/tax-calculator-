import { chromium } from 'playwright';

const SEARCH_URL = 'https://esearch.bcad.org/';

// Field names/selectors are unverified against the live site from this environment (outbound
// browser downloads and fetches to esearch.bcad.org were both blocked here). Treat this as a
// best-effort implementation to be corrected against the real DOM the first time it runs
// somewhere with network access to BCAD.
export async function lookupBexar({ address, zip }) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  });
  try {
    const page = await browser.newPage();
    await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });

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
}

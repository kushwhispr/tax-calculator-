import express from 'express';
import cors from 'cors';
import { scraperFor, countyName } from './scrapers/index.js';

const app = express();
app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/lookup', async (req, res) => {
  const { county, address, zip } = req.query;

  if (!county || !address || !zip) {
    return res.status(400).json({
      code: 'MISSING_FIELDS',
      message: 'County, address, and ZIP code are required.',
    });
  }

  const name = countyName(county);
  if (!name) {
    return res.status(400).json({ code: 'UNKNOWN_COUNTY', message: `Unknown county: ${county}` });
  }

  const scraper = scraperFor(county);
  if (!scraper) {
    return res.status(501).json({
      code: 'LOOKUP_UNAVAILABLE',
      message: `Automated lookup for ${name} County is not implemented yet.`,
    });
  }

  try {
    const result = await scraper({ address, zip });
    res.json(result);
  } catch (err) {
    res.status(502).json({
      code: 'LOOKUP_UNAVAILABLE',
      message: `The ${name} County appraisal district portal could not be reached or the property could not be matched (${err.message}).`,
    });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Backend listening on http://127.0.0.1:${PORT}`);
});

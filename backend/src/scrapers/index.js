import { lookupBexar } from './bcad.js';

export const SCRAPERS = {
  bexar: lookupBexar,
};

export function scraperFor(county) {
  return SCRAPERS[county] || null;
}

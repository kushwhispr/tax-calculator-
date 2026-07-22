import { makeEsearchLookup } from './esearch.js';

export const SCRAPERS = {
  bexar: makeEsearchLookup('https://esearch.bcad.org/'),
  blanco: makeEsearchLookup('https://esearch.blancocad.org/'),
  comal: makeEsearchLookup('https://esearch.comalad.org/'),
  guadalupe: makeEsearchLookup('https://esearch.guadalupead.org/'),
  hays: makeEsearchLookup('https://esearch.hayscad.com/'),
  kendall: makeEsearchLookup('https://esearch.kendallad.org/'),
};

export function scraperFor(county) {
  return SCRAPERS[county] || null;
}

import { makeEsearchLookup } from './esearch.js';

export const COUNTIES = {
  bexar: { name: 'Bexar', baseUrl: 'https://esearch.bcad.org/' },
  blanco: { name: 'Blanco', baseUrl: 'https://esearch.blancocad.org/' },
  comal: { name: 'Comal', baseUrl: 'https://esearch.comalad.org/' },
  guadalupe: { name: 'Guadalupe', baseUrl: 'https://esearch.guadalupead.org/' },
  hays: { name: 'Hays', baseUrl: 'https://esearch.hayscad.com/' },
  kendall: { name: 'Kendall', baseUrl: 'https://esearch.kendallad.org/' },
};

const SCRAPERS = Object.fromEntries(
  Object.entries(COUNTIES).map(([county, { baseUrl }]) => [county, makeEsearchLookup(baseUrl)])
);

export function scraperFor(county) {
  return SCRAPERS[county] || null;
}

export function countyName(county) {
  return COUNTIES[county]?.name || null;
}

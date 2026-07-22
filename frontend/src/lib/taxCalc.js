export const UNIT_TYPES = [
  { value: 'school', label: 'School District' },
  { value: 'city', label: 'City' },
  { value: 'county', label: 'County' },
  { value: 'other', label: 'Other (special district / hospital / college, etc.)' },
];

export const VET_TIERS = [
  { value: '', label: 'None' },
  { value: '10_29', label: 'Disabled veteran 10%–29%', amount: 5000 },
  { value: '30_49', label: 'Disabled veteran 30%–49%', amount: 7500 },
  { value: '50_69', label: 'Disabled veteran 50%–69%', amount: 10000 },
  { value: '70_100', label: 'Disabled veteran 70%–100%', amount: 12000 },
];

export const SCHOOL_GENERAL_HOMESTEAD_EXEMPTION = 140000;
export const SCHOOL_AGE65_OR_DISABLED_ADDITIONAL_EXEMPTION = 60000;

export function defaultExemptions() {
  return {
    homestead: false,
    over65: false,
    disabled: false,
    vetTier: '',
    vetAge65: false,
    vet100: false,
  };
}

export function vetExemptionAmount(exemptions) {
  if (!exemptions.vetTier) return 0;
  if (exemptions.vetAge65) return 12000;
  const tier = VET_TIERS.find((t) => t.value === exemptions.vetTier);
  return tier ? tier.amount : 0;
}

export function computeTaxableValue(marketValue, unit, exemptions) {
  if (exemptions.vet100) return 0;

  let value = marketValue;

  if (exemptions.homestead) {
    if (unit.localHomesteadPercent) {
      value -= marketValue * (unit.localHomesteadPercent / 100);
    }
    if (unit.localHomesteadAmount) {
      value -= unit.localHomesteadAmount;
    }
  }

  if (unit.type === 'school' && exemptions.homestead) {
    value -= SCHOOL_GENERAL_HOMESTEAD_EXEMPTION;
    if (exemptions.over65 || exemptions.disabled) {
      value -= SCHOOL_AGE65_OR_DISABLED_ADDITIONAL_EXEMPTION;
    }
  }

  if ((exemptions.over65 || exemptions.disabled) && unit.localOver65DisabledAmount) {
    value -= unit.localOver65DisabledAmount;
  }

  value -= vetExemptionAmount(exemptions);

  return Math.max(0, Math.round(value));
}

export function computeUnitLevy(taxableValue, ratePerHundred) {
  return (taxableValue * ratePerHundred) / 100;
}

export function computeSummary(marketValue, units, exemptions) {
  const enabledUnits = units.filter((u) => u.enabled);

  const rows = enabledUnits.map((unit) => {
    const taxableValue = computeTaxableValue(marketValue, unit, exemptions);
    const levy = computeUnitLevy(taxableValue, unit.rate);
    return { unit, taxableValue, levy };
  });

  const noExemptionRows = enabledUnits.map((unit) => {
    const taxableValue = computeTaxableValue(marketValue, unit, defaultExemptions());
    const levy = computeUnitLevy(taxableValue, unit.rate);
    return { unit, taxableValue, levy };
  });

  const totalLevy = rows.reduce((sum, r) => sum + r.levy, 0);
  const totalLevyNoExemption = noExemptionRows.reduce((sum, r) => sum + r.levy, 0);

  return {
    rows,
    annualTax: totalLevy,
    monthlyTax: totalLevy / 12,
    effectiveRate: marketValue > 0 ? (totalLevy / marketValue) * 100 : 0,
    exemptionSavings: totalLevyNoExemption - totalLevy,
  };
}

export function computeComparison(currentMarketValue, whatIfMarketValue, units, currentExemptions, whatIfExemptions) {
  const current = computeSummary(currentMarketValue, units, currentExemptions);
  const whatIf = computeSummary(whatIfMarketValue, units, whatIfExemptions);
  return {
    current,
    whatIf,
    annualDifference: whatIf.annualTax - current.annualTax,
    monthlyDifference: whatIf.monthlyTax - current.monthlyTax,
  };
}

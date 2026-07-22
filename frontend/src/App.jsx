import { useMemo, useState } from 'react';
import LookupForm from './components/LookupForm';
import ExemptionPicker from './components/ExemptionPicker';
import UnitsTable, { makeUnit } from './components/UnitsTable';
import SummaryPanel from './components/SummaryPanel';
import PrintReport from './components/PrintReport';
import { lookupProperty } from './lib/api';
import { computeComparison, defaultExemptions } from './lib/taxCalc';
import './App.css';

function emptyProperty() {
  return { county: '', address: '', zip: '', year: '', preliminary: false };
}

export default function App() {
  const [stage, setStage] = useState('lookup');
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [property, setProperty] = useState(emptyProperty());
  const [units, setUnits] = useState([]);
  const [currentMarketValue, setCurrentMarketValue] = useState(0);
  const [whatIfMarketValue, setWhatIfMarketValue] = useState(0);
  const [currentExemptions, setCurrentExemptions] = useState(defaultExemptions());
  const [whatIfExemptions, setWhatIfExemptions] = useState(defaultExemptions());

  const comparison = useMemo(
    () => computeComparison(currentMarketValue, whatIfMarketValue, units, currentExemptions, whatIfExemptions),
    [currentMarketValue, whatIfMarketValue, units, currentExemptions, whatIfExemptions]
  );

  function startManual(countyOverride) {
    setProperty({ ...emptyProperty(), county: countyOverride || 'bexar' });
    setUnits([makeUnit({ name: '', type: 'school' })]);
    setCurrentMarketValue(0);
    setWhatIfMarketValue(0);
    setCurrentExemptions(defaultExemptions());
    setWhatIfExemptions(defaultExemptions());
    setStage('workspace');
  }

  async function handleLookup({ county, address, zip }) {
    setLoading(true);
    setLookupError('');
    try {
      const result = await lookupProperty({ county, address, zip });
      setProperty({
        county,
        address,
        zip,
        year: result.year,
        preliminary: result.preliminary,
      });
      const loadedUnits = result.taxingUnits.map((u) => makeUnit({ ...u, source: 'lookup' }));
      setUnits(loadedUnits);
      setCurrentMarketValue(result.marketValue || 0);
      setWhatIfMarketValue(result.marketValue || 0);
      setCurrentExemptions(defaultExemptions());
      setWhatIfExemptions(defaultExemptions());
      setStage('workspace');
    } catch (err) {
      setLookupError(
        err.code === 'LOOKUP_UNAVAILABLE'
          ? `${err.message} You can continue by entering the property manually.`
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStage('lookup');
    setLookupError('');
    setProperty(emptyProperty());
    setUnits([]);
    setCurrentExemptions(defaultExemptions());
    setWhatIfExemptions(defaultExemptions());
  }

  if (stage === 'lookup') {
    return (
      <div className="app-shell">
        <header>
          <h1>Central Texas Property Tax Calculator</h1>
          <p className="subtitle">Public record lookups and what-if tax estimates for Bexar, Blanco, Comal, Guadalupe, Hays, and Kendall counties.</p>
        </header>
        <LookupForm onLookup={handleLookup} onManualStart={() => startManual()} loading={loading} />
        {lookupError && <p className="error card">{lookupError}</p>}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="no-print">
        <h1>Central Texas Property Tax Calculator</h1>
        <div className="header-actions">
          <button type="button" className="secondary" onClick={reset}>Start Over</button>
          <button type="button" onClick={() => window.print()}>Print / Save as PDF</button>
        </div>
      </header>

      <section className="card no-print">
        <h2>Property</h2>
        <div className="property-meta-grid">
          <label>
            County
            <input
              type="text"
              value={property.county}
              onChange={(e) => setProperty({ ...property, county: e.target.value })}
            />
          </label>
          <label>
            Address
            <input
              type="text"
              value={property.address}
              onChange={(e) => setProperty({ ...property, address: e.target.value })}
            />
          </label>
          <label>
            ZIP
            <input
              type="text"
              value={property.zip}
              onChange={(e) => setProperty({ ...property, zip: e.target.value })}
            />
          </label>
          <label>
            Tax Year
            <input
              type="text"
              value={property.year || ''}
              onChange={(e) => setProperty({ ...property, year: e.target.value })}
            />
          </label>
        </div>
        {property.preliminary && (
          <p className="hint">This year's values are labeled preliminary / work-in-progress by the source portal.</p>
        )}
      </section>

      <section className="card no-print">
        <h2>Market Value</h2>
        <div className="value-grid">
          <label>
            Current Record Market Value
            <input
              type="number"
              value={currentMarketValue}
              onChange={(e) => setCurrentMarketValue(Number(e.target.value))}
            />
          </label>
          <label>
            What-If Market Value
            <input
              type="number"
              value={whatIfMarketValue}
              onChange={(e) => setWhatIfMarketValue(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="card no-print exemptions-grid">
        <ExemptionPicker title="Current Record Exemptions" exemptions={currentExemptions} onChange={setCurrentExemptions} />
        <ExemptionPicker title="What-If Exemptions" exemptions={whatIfExemptions} onChange={setWhatIfExemptions} />
      </section>

      <section className="card no-print">
        <h2>Taxing Units</h2>
        <UnitsTable units={units} onChange={setUnits} summaryRows={comparison.whatIf.rows} />
      </section>

      <div className="no-print">
        <SummaryPanel comparison={comparison} />
      </div>

      <PrintReport property={property} comparison={comparison} />
    </div>
  );
}

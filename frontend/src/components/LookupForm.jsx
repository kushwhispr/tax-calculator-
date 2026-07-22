import { useState } from 'react';
import { COUNTIES } from '../lib/counties';

export default function LookupForm({ onLookup, onManualStart, loading }) {
  const [county, setCounty] = useState('bexar');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [formError, setFormError] = useState('');

  const selectedCounty = COUNTIES.find((c) => c.value === county);

  function handleSubmit(e) {
    e.preventDefault();
    if (!county || !address.trim() || !zip.trim()) {
      setFormError('County, complete street address, and ZIP code are all required.');
      return;
    }
    setFormError('');
    onLookup({ county, address: address.trim(), zip: zip.trim() });
  }

  return (
    <section className="card">
      <h2>Look Up a Property</h2>
      <form onSubmit={handleSubmit} className="lookup-form">
        <label>
          County
          <select value={county} onChange={(e) => setCounty(e.target.value)}>
            {COUNTIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
        <label>
          Street Address
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St"
          />
        </label>
        <label>
          ZIP Code
          <input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="78201"
          />
        </label>
        <div className="lookup-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search Public Records'}
          </button>
          <button type="button" className="secondary" onClick={onManualStart} disabled={loading}>
            Skip Lookup — Enter Manually
          </button>
        </div>
      </form>
      {formError && <p className="error">{formError}</p>}
      {selectedCounty?.supportsLookup ? (
        <p className="hint">
          Automated lookup for {selectedCounty?.label} is unverified against the live portal and
          may fail or return incomplete data. If it does, use "Enter Manually" instead.
        </p>
      ) : (
        <p className="hint">
          Automated lookup for {selectedCounty?.label} is not available yet in this build. Use
          "Enter Manually" to build an estimate from your own records.
        </p>
      )}
    </section>
  );
}

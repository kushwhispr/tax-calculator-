import { money } from '../lib/format';

export default function PrintReport({ property, comparison }) {
  const { current, whatIf, annualDifference, monthlyDifference } = comparison;
  const allUnitIds = Array.from(new Set([
    ...current.rows.map((r) => r.unit.id),
    ...whatIf.rows.map((r) => r.unit.id),
  ]));
  const currentById = new Map(current.rows.map((r) => [r.unit.id, r]));
  const whatIfById = new Map(whatIf.rows.map((r) => [r.unit.id, r]));

  return (
    <div className="print-report">
      <h1>Property Tax Estimate Report</h1>
      <p className="print-meta">
        {property.county ? `${property.county} County` : 'County not set'} — {property.address || 'Address not set'} {property.zip}
      </p>
      <p className="print-disclaimer">
        Estimate only. Not an official tax bill. Over-65/disabled ceilings, freezes, and transfers
        are not calculated. Verify all figures with the appraisal district and tax office.
      </p>

      <table className="print-table">
        <thead>
          <tr>
            <th>Taxing Unit</th>
            <th>Rate</th>
            <th>Current Taxable Value</th>
            <th>Current Levy</th>
            <th>What-If Taxable Value</th>
            <th>What-If Levy</th>
          </tr>
        </thead>
        <tbody>
          {allUnitIds.map((id) => {
            const c = currentById.get(id);
            const w = whatIfById.get(id);
            const unit = (c || w).unit;
            return (
              <tr key={id}>
                <td>{unit.name || '(unnamed unit)'}</td>
                <td>{unit.rate}</td>
                <td>{c ? money(c.taxableValue) : '—'}</td>
                <td>{c ? money(c.levy) : '—'}</td>
                <td>{w ? money(w.taxableValue) : '—'}</td>
                <td>{w ? money(w.levy) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td></td>
            <td></td>
            <td>{money(current.annualTax)}</td>
            <td></td>
            <td>{money(whatIf.annualTax)}</td>
          </tr>
        </tfoot>
      </table>

      <table className="print-summary">
        <tbody>
          <tr><td>Monthly Tax (Current)</td><td>{money(current.monthlyTax)}</td></tr>
          <tr><td>Monthly Tax (What-If)</td><td>{money(whatIf.monthlyTax)}</td></tr>
          <tr><td>Effective Rate (Current)</td><td>{current.effectiveRate.toFixed(4)}%</td></tr>
          <tr><td>Effective Rate (What-If)</td><td>{whatIf.effectiveRate.toFixed(4)}%</td></tr>
          <tr><td>Annual Difference</td><td>{money(annualDifference)}</td></tr>
          <tr><td>Monthly Escrow Impact</td><td>{money(monthlyDifference)}</td></tr>
        </tbody>
      </table>

      <p className="print-footer">Generated {new Date().toLocaleString()}</p>
    </div>
  );
}

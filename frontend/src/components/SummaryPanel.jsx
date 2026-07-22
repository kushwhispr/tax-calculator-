import { money } from '../lib/format';

export default function SummaryPanel({ comparison }) {
  const { current, whatIf, annualDifference, monthlyDifference } = comparison;
  return (
    <section className="card summary-panel">
      <h2>Summary</h2>
      <table className="summary-table">
        <thead>
          <tr>
            <th></th>
            <th>Current Record</th>
            <th>What-If</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Annual Tax</td>
            <td>{money(current.annualTax)}</td>
            <td>{money(whatIf.annualTax)}</td>
          </tr>
          <tr>
            <td>Monthly Tax</td>
            <td>{money(current.monthlyTax)}</td>
            <td>{money(whatIf.monthlyTax)}</td>
          </tr>
          <tr>
            <td>Effective Tax Rate</td>
            <td>{current.effectiveRate.toFixed(4)}%</td>
            <td>{whatIf.effectiveRate.toFixed(4)}%</td>
          </tr>
          <tr>
            <td>Exemption Savings</td>
            <td>{money(current.exemptionSavings)}</td>
            <td>{money(whatIf.exemptionSavings)}</td>
          </tr>
        </tbody>
      </table>
      <div className="diff-callout">
        <div>
          <span className="diff-label">Annual Difference (What-If − Current)</span>
          <span className={annualDifference >= 0 ? 'diff-up' : 'diff-down'}>
            {annualDifference >= 0 ? '+' : ''}{money(annualDifference)}
          </span>
        </div>
        <div>
          <span className="diff-label">Monthly Escrow Impact</span>
          <span className={monthlyDifference >= 0 ? 'diff-up' : 'diff-down'}>
            {monthlyDifference >= 0 ? '+' : ''}{money(monthlyDifference)}
          </span>
        </div>
      </div>
    </section>
  );
}

import { UNIT_TYPES } from '../lib/taxCalc';

let nextId = 1;
export function makeUnit(overrides = {}) {
  return {
    id: `unit-${nextId++}`,
    name: '',
    type: 'other',
    rate: 0,
    enabled: true,
    localHomesteadAmount: 0,
    localHomesteadPercent: 0,
    localOver65DisabledAmount: 0,
    source: 'manual',
    ...overrides,
  };
}

export default function UnitsTable({ units, onChange, summaryRows }) {
  function updateUnit(id, field, value) {
    onChange(units.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  }

  function removeUnit(id) {
    onChange(units.filter((u) => u.id !== id));
  }

  function addUnit() {
    onChange([...units, makeUnit()]);
  }

  const rowById = new Map((summaryRows || []).map((r) => [r.unit.id, r]));

  return (
    <div className="units-table-wrap">
      <table className="units-table">
        <thead>
          <tr>
            <th>On</th>
            <th>Taxing Unit</th>
            <th>Type</th>
            <th>Rate ($/$100)</th>
            <th>Local Homestead $</th>
            <th>Local Homestead %</th>
            <th>Local Over-65/Disabled $</th>
            <th>Taxable Value</th>
            <th>Estimated Levy</th>
            <th>Source</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => {
            const row = rowById.get(unit.id);
            return (
              <tr key={unit.id} className={unit.enabled ? '' : 'disabled-row'}>
                <td>
                  <input
                    type="checkbox"
                    checked={unit.enabled}
                    onChange={(e) => updateUnit(unit.id, 'enabled', e.target.checked)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={unit.name}
                    onChange={(e) => updateUnit(unit.id, 'name', e.target.value)}
                    placeholder="e.g. Northside ISD"
                  />
                </td>
                <td>
                  <select
                    value={unit.type}
                    onChange={(e) => updateUnit(unit.id, 'type', e.target.value)}
                  >
                    {UNIT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    step="0.0001"
                    value={unit.rate}
                    onChange={(e) => updateUnit(unit.id, 'rate', Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="1"
                    value={unit.localHomesteadAmount}
                    onChange={(e) => updateUnit(unit.id, 'localHomesteadAmount', Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    value={unit.localHomesteadPercent}
                    onChange={(e) => updateUnit(unit.id, 'localHomesteadPercent', Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="1"
                    value={unit.localOver65DisabledAmount}
                    onChange={(e) => updateUnit(unit.id, 'localOver65DisabledAmount', Number(e.target.value))}
                  />
                </td>
                <td className="readonly-cell">
                  {row ? `$${row.taxableValue.toLocaleString()}` : '—'}
                </td>
                <td className="readonly-cell">
                  {row ? `$${row.levy.toFixed(2)}` : '—'}
                </td>
                <td className="source-cell">{unit.source}</td>
                <td>
                  <button type="button" className="link-danger" onClick={() => removeUnit(unit.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button type="button" className="secondary" onClick={addUnit}>+ Add Taxing Unit</button>
    </div>
  );
}

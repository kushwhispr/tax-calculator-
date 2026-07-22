import { VET_TIERS } from '../lib/taxCalc';

export default function ExemptionPicker({ title, exemptions, onChange }) {
  function set(field, value) {
    onChange({ ...exemptions, [field]: value });
  }

  return (
    <fieldset className="exemption-picker">
      <legend>{title}</legend>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={exemptions.homestead}
          onChange={(e) => set('homestead', e.target.checked)}
        />
        Residence homestead
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={exemptions.over65}
          onChange={(e) => set('over65', e.target.checked)}
        />
        Age 65 or older
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={exemptions.disabled}
          onChange={(e) => set('disabled', e.target.checked)}
        />
        Disabled person
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={exemptions.vet100}
          onChange={(e) => set('vet100', e.target.checked)}
        />
        Qualifying 100% disabled or individual-unemployability residence homestead
      </label>
      <label className="select-row">
        Disabled veteran rating
        <select
          value={exemptions.vetTier}
          onChange={(e) => set('vetTier', e.target.value)}
          disabled={exemptions.vet100}
        >
          {VET_TIERS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      {exemptions.vetTier && (
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={exemptions.vetAge65}
            onChange={(e) => set('vetAge65', e.target.checked)}
          />
          Also age 65 or older (estimates at $12,000)
        </label>
      )}
      <p className="hint small">
        Over-65 and disabled tax ceilings, freezes, and transfers are not calculated. The actual
        bill for a qualifying owner may be lower than this estimate.
      </p>
    </fieldset>
  );
}

/**
 * Sets a progress bar's width and its paired value label.
 *
 * @param {Object} opts
 * @param {string} opts.barId    - element id of the bar fill div
 * @param {string} [opts.valueId] - element id of the text label showing the value (optional)
 * @param {number} opts.value    - the raw value (e.g. grams)
 * @param {string} [opts.unit]   - suffix appended to the label, e.g. "g"
 * @param {number} opts.percent  - width percentage (0-100), already computed by the caller
 */
export function setBar({ barId, valueId, value, unit = "", percent }) {
  const bar = document.getElementById(barId);
  if (bar) {
    const clamped = Math.max(0, Math.min(100, percent));
    bar.style.width = `${clamped}%`;
  }

  if (valueId) {
    const label = document.getElementById(valueId);
    if (label) label.textContent = `${value}${unit}`;
  }
}

/**
 * Sets a group of macro bars relative to each other (the largest value = 100%).
 * Useful when there's no fixed daily-value reference, just a visual comparison.
 *
 * @param {Object[]} entries
 * @param {string} entries[].barId
 * @param {string} [entries[].valueId]
 * @param {number} entries[].value
 * @param {string} [entries[].unit]
 */
export function setBarsRelative(entries) {
  const max = Math.max(...entries.map((e) => e.value || 0), 1);
  entries.forEach((e) => {
    setBar({
      barId: e.barId,
      valueId: e.valueId,
      value: e.value,
      unit: e.unit,
      percent: ((e.value || 0) / max) * 100,
    });
  });
}

/**
 * Sets a group of bars against a fixed target (e.g. daily goals or %DV).
 *
 * @param {Object[]} entries
 * @param {string} entries[].barId
 * @param {string} [entries[].valueId]
 * @param {number} entries[].value
 * @param {number} entries[].target
 * @param {string} [entries[].unit]
 */
export function setBarsAgainstTarget(entries) {
  entries.forEach((e) => {
    const percent = e.target ? ((e.value || 0) / e.target) * 100 : 0;
    setBar({
      barId: e.barId,
      valueId: e.valueId,
      value: e.value,
      unit: e.unit,
      percent,
    });
  });
}
/**
 * Traffic Light server-load indicator (replaces off-peak notifications).
 *
 * v1 is a pure client-side time heuristic based on CET windows converted to
 * the user's local time. The component consumes this module's output shape
 * ({ state, label, message }) so a real server-load API can replace the
 * heuristic later without touching the UI.
 *
 * Windows (CET):
 *   🔴 Peak      12:00–23:00 — muddier low-end, weaker dynamic range
 *   🟢 Off-peak  02:00–07:00 — best dynamic range and separation
 *   🟡 Shoulder  everything else
 */

/** Current hour in CET (Central European Time, DST-aware) for a given Date. */
export function cetHour(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    hour12: false,
  });
  return Number(formatter.format(date)) % 24;
}

export function trafficLightState(date = new Date()) {
  const hour = cetHour(date);
  if (hour >= 12 && hour < 23) {
    return {
      state: 'red',
      label: 'PEAK',
      message:
        'Peak hours — expect muddier low-end and weaker dynamic range. Consider saving to Vault and generating later.',
    };
  }
  if (hour >= 2 && hour < 7) {
    return {
      state: 'green',
      label: 'OFF-PEAK',
      message: 'Optimal window — best dynamic range and instrument separation.',
    };
  }
  return {
    state: 'yellow',
    label: 'SHOULDER',
    message: 'Shoulder hours — decent output quality, off-peak is better.',
  };
}

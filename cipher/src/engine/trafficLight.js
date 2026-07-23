/**
 * Traffic Light — QUEUE-SPEED indicator (v2 reframe, A4 of docs/V2_SPEC.md).
 *
 * Research verdict: time-of-day QUALITY degradation is unverified folklore;
 * what is documented is generation SPEED varying with load (Suno's priority
 * queue exists for exactly this). v2 keeps the indicator but makes only
 * speed claims. Client-side CET heuristic; the component consumes
 * ({ state, label, message }) so a real load API can replace it later.
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
      label: 'BUSY QUEUE',
      message:
        'Peak usage hours — generations may be slower. Output quality is unaffected. Save to Vault now, run later if you hate waiting.',
    };
  }
  if (hour >= 2 && hour < 7) {
    return {
      state: 'green',
      label: 'FAST QUEUE',
      message: 'Quiet hours — generations should come back fastest.',
    };
  }
  return {
    state: 'yellow',
    label: 'MODERATE',
    message: 'Moderate load — normal generation speed expected.',
  };
}

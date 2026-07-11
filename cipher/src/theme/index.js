/**
 * CIPHER design tokens — dark theme only (no light theme in v1).
 * Aesthetic: studio equipment, not consumer app. Monospace counters,
 * precise numbers, LED-style indicators.
 */
export const colors = {
  body: '#0A0A0F',
  card: '#16161F',
  cardRaised: '#1E1E2A',
  border: '#26262f',
  text: '#FFFFFF',
  textDim: '#9A9AA8',
  accent: '#00E5A0', // signal green — freshness / traffic-light-good / CTAs
  warn: '#FFC24D', // yellow states
  danger: '#FF4D6D', // warnings / red states
};

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodyBold: 'Inter_700Bold',
  // Monospace for character counters and LED-style readouts.
  mono: Platform_select_mono(),
};

function Platform_select_mono() {
  // Resolved lazily so the theme module stays importable from plain Node
  // (the engine tests import nothing from here, but keep it safe anyway).
  try {
    // eslint-disable-next-line global-require
    const { Platform } = require('react-native');
    return Platform.OS === 'ios' ? 'Menlo' : 'monospace';
  } catch {
    return 'monospace';
  }
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 16 };

export const Colors = {
  // Base
  background: '#0A0E14',
  surface: '#111722',
  surfaceRaised: '#18202E',
  border: '#1E2A3A',
  borderSubtle: '#162030',

  // Brand — steel teal
  primary: '#3D8FA6',
  primaryLight: '#6AAFBF',
  primaryDim: '#1A3D4A',
  primaryGlow: 'rgba(61, 143, 166, 0.13)',

  // Text
  textPrimary: '#DCE8F0',
  textSecondary: '#5A7A8A',
  textMuted: '#2E4455',
  textInverse: '#0A0E14',

  // Semantic
  success: '#3D8FA6',
  error: '#7A4A4A',
};

export const Typography = {
  // Display — hero numbers (streak, stats)
  display: {
    fontFamily: 'System',
    fontSize: 72,
    fontWeight: '200' as const,
    letterSpacing: -3,
    lineHeight: 72,
    color: Colors.textPrimary,
  },
  // Large data — secondary numbers
  data: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  // Headings
  h1: {
    fontFamily: 'System',
    fontSize: 34,
    fontWeight: '300' as const,
    letterSpacing: -1,
    lineHeight: 40,
    color: Colors.textPrimary,
  },
  h2: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '300' as const,
    letterSpacing: -0.8,
    lineHeight: 34,
    color: Colors.textPrimary,
  },
  h3: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '400' as const,
    letterSpacing: -0.3,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  // Body
  body: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0.1,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: Colors.textSecondary,
  },
  // Eyebrow — section labels, uppercase small caps
  eyebrow: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 1.8,
    lineHeight: 16,
    color: Colors.primary,
  },
  // Label — UI elements, tabs, buttons
  label: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  glow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};

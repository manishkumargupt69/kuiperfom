export const COLORS = {
  background: "#F7F8F6",
  surface: "#FFFFFF",
  surfaceMuted: "#F0F2EF",
  ink: "#1B1D1B",
  inkMuted: "#686D68",
  accent: "#176B5D",
  accentPressed: "#125448",
  accentSoft: "#E5F0ED",
  border: "#E1E4E0",
  danger: "#B42318",
  warningBackground: "#FEF0C7",
  warningInk: "#B54708",
  successBackground: "#ECFDF3",
  successInk: "#027A48",
  neutralBackground: "#F2F4F7",
  neutralInk: "#475467",
  white: "#FFFFFF",
} as const;

export const SPACING = {
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 24,
  section: 32,
} as const;

export const RADII = {
  small: 6,
  medium: 10,
  large: 14,
  pill: 999,
} as const;

export const TYPOGRAPHY = {
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
  },
  control: {
    fontSize: 16,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  screenTitle: {
    fontSize: 30,
    lineHeight: 36,
  },
} as const;

export const CONTROL_HEIGHT = 52;
export const MINIMUM_TOUCH_SIZE = 48;
export const SCREEN_HORIZONTAL_PADDING = 20;
export const MAX_CONTENT_WIDTH = 600;

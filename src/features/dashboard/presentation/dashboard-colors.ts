import { COLORS } from "@/src/theme/tokens";

const STATUS_COLORS: Readonly<Record<string, string>> = {
  PENDING: COLORS.warningInk,
  ASSIGNED: "#2563EB",
  STARTED: "#6929C4",
  HOLD: COLORS.danger,
  COMPLETED: COLORS.successInk,
};

const STATUS_SURFACES: Readonly<Record<string, string>> = {
  PENDING: COLORS.warningBackground,
  ASSIGNED: "#EAF1FF",
  STARTED: "#F0EAFB",
  HOLD: COLORS.dangerSoft,
  COMPLETED: COLORS.successBackground,
};

const CITY_COLORS = [
  "#6929C4", "#1192E8", "#005D5D", "#9F1853",
  "#198038", "#002D9C", "#B28600", "#8A3800",
] as const;

export const getStatusColor = (status: string): string => STATUS_COLORS[status] ?? COLORS.neutralInk;
export const getStatusSurface = (status: string): string => STATUS_SURFACES[status] ?? COLORS.neutralBackground;
export const getCityColor = (index: number): string => CITY_COLORS[index % CITY_COLORS.length];

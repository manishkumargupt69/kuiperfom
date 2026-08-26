const DATABASE_DATE_PATTERN =
  /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}(?::\d{2})?)$/;
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  hour: "2-digit",
  hour12: true,
  minute: "2-digit",
  month: "short",
  year: "numeric",
});

const getPart = (
  parts: readonly Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string => parts.find((part) => part.type === type)?.value ?? "";

export const formatDateTime = (value: string): string => {
  const normalizedValue = value.replace(DATABASE_DATE_PATTERN, "$1T$2");
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return "—";

  const parts = DATE_TIME_FORMATTER.formatToParts(date);
  const day = getPart(parts, "day");
  const month = getPart(parts, "month").toLocaleUpperCase();
  const year = getPart(parts, "year");
  const hour = getPart(parts, "hour");
  const minute = getPart(parts, "minute");
  const dayPeriod = getPart(parts, "dayPeriod").toLocaleUpperCase();
  return `${day} ${month} ${year} ${hour}:${minute} ${dayPeriod}`;
};

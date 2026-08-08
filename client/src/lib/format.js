const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(value) {
  return String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

export function formatPrice(value, latin = false) {
  const amount = Number(value) || 0;
  const text = latin ? String(amount) : toArabicDigits(amount).replace(".", "٫");
  return `${text} ₪`;
}

export function formatArabicCount(count) {
  if (count === 1) return "صنف واحد";
  if (count === 2) return "صنفين";
  return `${toArabicDigits(count)} أصناف`;
}

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function formatOrderDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const startOfDay = (value) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const daysDiff = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86400000,
  );
  if (daysDiff === 0) return "اليوم";
  if (daysDiff === 1) return "أمس";
  return `${toArabicDigits(date.getDate())} ${ARABIC_MONTHS[date.getMonth()]} ${toArabicDigits(date.getFullYear())}`;
}

// "18:47" → "٦:٤٧ م" — 12-hour clock with Arabic-Indic digits (AGENTS.md §5).
// Used for delivery ETAs on the order-tracking screen. Pass `latin` (owner
// dashboard) to keep the digits Latin.
export function formatTime(iso, latin = false) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const period = date.getHours() >= 12 ? "م" : "ص";
  const hour12 = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const digits = (value) => (latin ? String(value) : toArabicDigits(value));
  return `${digits(hour12)}:${digits(minutes)} ${period}`;
}

// "2026-08-03T18:47:00" → "٣ أغسطس ٢٠٢٦ · ٦:٤٧ م". Full date + time for the
// order-timeline rows (single source of truth for month names/time formatting).
export function formatDateTime(iso, latin = false) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const digits = (value) => (latin ? String(value) : toArabicDigits(value));
  return `${digits(date.getDate())} ${ARABIC_MONTHS[date.getMonth()]} ${digits(date.getFullYear())} · ${formatTime(iso, latin)}`;
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(value) {
  return String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

export function formatPrice(value) {
  return `${toArabicDigits(value).replace(".", "٫")} ₪`;
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
// Used for delivery ETAs on the order-tracking screen.
export function formatTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const period = date.getHours() >= 12 ? "م" : "ص";
  const hour12 = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${toArabicDigits(hour12)}:${toArabicDigits(minutes)} ${period}`;
}

// "2026-08-03T18:47:00" → "٣ أغسطس ٢٠٢٦ · ٦:٤٧ م". Full date + time for the
// order-timeline rows (single source of truth for month names/time formatting).
export function formatDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${toArabicDigits(date.getDate())} ${ARABIC_MONTHS[date.getMonth()]} ${toArabicDigits(date.getFullYear())} · ${formatTime(iso)}`;
}

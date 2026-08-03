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

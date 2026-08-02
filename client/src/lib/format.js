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

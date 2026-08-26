export function normalizeIndianMobile(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("091")) return digits.slice(3);
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

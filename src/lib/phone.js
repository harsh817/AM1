export function normalizeIndianMobile(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("091")) return digits.slice(3);
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function normalizeInternationalPhone(phone) {
  return String(phone ?? "").replace(/\D/g, "");
}

export function normalizePhoneInput(phone, countryCode = "+91") {
  const digits = normalizeInternationalPhone(phone);
  const callingCode = normalizeInternationalPhone(countryCode);
  if (callingCode && digits.startsWith(callingCode) && digits.length > callingCode.length + 6) {
    return digits.slice(callingCode.length);
  }
  return digits;
}

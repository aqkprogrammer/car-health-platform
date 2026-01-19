// Utility functions

/**
 * Formats a phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  // Remove +91 prefix if present
  const cleaned = phone.replace(/^\+91/, "");
  // Format as XXX-XXX-XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats currency based on locale
 */
export function formatCurrency(amount: number, currency: "INR" | "EUR" = "INR"): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-EU", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Builds a WhatsApp deep-link with a pre-filled Roman Urdu message.
 *
 * Used on listing cards where both category and city are known.
 * The provider profile page (ContactSection) has its own independent message
 * and does NOT use this utility — they serve different contexts.
 *
 * @param {string} phone         Provider phone number (any format)
 * @param {string} providerName  Provider display name
 * @param {string} [category]    Service category label (e.g. "Electrician")
 * @param {string} [city]        City name (e.g. "Karachi")
 * @returns {string}             Full wa.me URL
 */
export function buildWhatsAppLink(phone, providerName, category = "", city = "") {
  const digits = String(phone || "").replace(/[^0-9]/g, "");
  // Convert Pakistani local numbers (03xx…) to international format
  const intlNumber = digits.startsWith("0") ? "92" + digits.slice(1) : digits;

  const subject =
    category && city
      ? `${category} ki service chahiye ${city} mein`
      : category
      ? `${category} ki service chahiye`
      : "aapki service chahiye";

  const message = `Hi ${providerName}, Main Service Markaz ke zariye aap se contact kar raha hoon. Mujhe ${subject}. Kya aap available hain?`;

  return `https://wa.me/${intlNumber}?text=${encodeURIComponent(message)}`;
}

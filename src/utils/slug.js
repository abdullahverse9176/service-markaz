// Utility function to generate URL-friendly slugs
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
};

// Get provider URL slug - Format: category-name-area-city-id (unique + SEO friendly)
// Works with both numeric IDs (static data) and MongoDB ObjectId strings.
export const getProviderSlug = (provider) => {
  const nameSlug = generateSlug(provider.name);
  const categorySlug = generateSlug(provider.category.replace("-", " "));
  const areaSlug = provider.area ? generateSlug(provider.area) : generateSlug(provider.city);
  const citySlug = generateSlug(provider.city);
  // Use _id (MongoDB) when available, fall back to numeric id (static data)
  const id = provider._id?.toString() || provider.id;

  // Format: "{category}-{name}-{area}-{city}-{id}"
  return `${categorySlug}-${nameSlug}-${areaSlug}-${citySlug}-${id}`;
};

/**
 * Extract the provider ID from a slug.
 * Returns { id: string, type: "mongo" | "numeric" } or null.
 */
export const extractIdFromSlug = (slug) => {
  // MongoDB ObjectId: 24 lowercase hex chars
  const mongoMatch = slug.match(/-([a-f0-9]{24})$/i);
  if (mongoMatch) return { id: mongoMatch[1], type: "mongo" };
  // Legacy numeric ID
  const numericMatch = slug.match(/-(\d+)$/);
  if (numericMatch) return { id: numericMatch[1], type: "numeric" };
  return null;
};

// Find provider by slug - Extract ID from end and lookup (legacy static data only)
export const findProviderBySlug = (slug, providers) => {
  // Extract numeric ID from end of slug
  const idMatch = slug.match(/-(\d+)$/);
  if (!idMatch) return null;
  
  const providerId = parseInt(idMatch[1]);
  const provider = providers.find(p => p.id === providerId);
  
  // Verify slug matches (prevent accessing different provider via modified slug)
  if (provider && getProviderSlug(provider) === slug) {
    return provider;
  }
  
  return null;
};

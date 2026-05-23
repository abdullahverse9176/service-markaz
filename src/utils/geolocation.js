export const CITY_COORDS = {
  lahore: { lat: 31.5204, lng: 74.3587 },
  karachi: { lat: 24.8607, lng: 67.0011 },
  islamabad: { lat: 33.6844, lng: 73.0479 },
  rawalpindi: { lat: 33.6007, lng: 73.0679 },
  faisalabad: { lat: 31.4504, lng: 73.135 },
  multan: { lat: 30.1575, lng: 71.5249 },
  peshawar: { lat: 34.0151, lng: 71.5249 },
  quetta: { lat: 30.1798, lng: 66.975 },
  hyderabad: { lat: 25.396, lng: 68.3578 },
  gujranwala: { lat: 32.1877, lng: 74.1945 },
  sialkot: { lat: 32.4945, lng: 74.5229 },
  abbottabad: { lat: 34.1558, lng: 73.2194 },
  bahawalpur: { lat: 29.3956, lng: 71.6722 },
  sargodha: { lat: 32.0836, lng: 72.6711 },
  sukkur: { lat: 27.7052, lng: 68.8574 },
  larkana: { lat: 27.558, lng: 68.2143 },
  mardan: { lat: 34.1987, lng: 72.0404 },
  sahiwal: { lat: 30.6682, lng: 73.1068 },
  gujrat: { lat: 32.5735, lng: 74.0779 },
};

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find nearest city slug from a list of city objects { slug, name }.
 * Works with Browser Geolocation API output coordinates.
 */
export function findNearestCitySlug(lat, lng, cities) {
  let nearest = null;
  let minDist = Infinity;
  for (const city of cities) {
    const coords = CITY_COORDS[city.slug?.toLowerCase()];
    if (!coords) continue;
    const dist = haversine(lat, lng, coords.lat, coords.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }
  return nearest?.slug || null;
}

/**
 * Wrapper around navigator.geolocation.getCurrentPosition.
 * Returns a Promise that resolves with { slug, name, userLat, userLng } of nearest city,
 * or rejects with an error message string.
 *
 * @param {{ slug: string, name: string }[]} cities
 * @returns {Promise<{ slug: string, name: string, userLat: number, userLng: number }>}
 */
export function getNearestCity(cities) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Your browser does not support location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        // Try to find the nearest city slug for display purposes.
        // Even if no city matches (e.g. cities not yet loaded), we still
        // resolve with the GPS coordinates so Near Me works everywhere.
        const slug = findNearestCitySlug(userLat, userLng, cities);
        if (slug) {
          const city = cities.find((c) => c.slug === slug);
          resolve({ ...(city || { slug, name: slug }), userLat, userLng });
        } else {
          resolve({ slug: null, name: null, userLat, userLng });
        }
      },
      (err) => {
        const msg =
          err?.code === 1
            ? "Location access denied. Please allow location in your browser settings."
            : err?.code === 3
            ? "Location request timed out. Please try again."
            : "Unable to retrieve your location. Please try again.";
        reject(msg);
      },
      { timeout: 8000 }
    );
  });
}

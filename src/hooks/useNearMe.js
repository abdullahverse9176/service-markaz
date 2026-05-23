"use client";

import { useState } from "react";
import { getNearestCity } from "@/utils/geolocation";

/**
 * Shared Near Me hook — manages geolocation state used by both
 * BusinessesClient (services page) and HeroSection (home page).
 *
 * @param {number|null} initialLat  – pre-set latitude (e.g. from URL param)
 * @param {number|null} initialLng  – pre-set longitude (e.g. from URL param)
 */
export function useNearMe(initialLat = null, initialLng = null) {
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [nearMeActive, setNearMeActive] = useState(!!(initialLat && initialLng));
  const [userLat, setUserLat] = useState(initialLat);
  const [userLng, setUserLng] = useState(initialLng);

  /**
   * Request GPS location, find nearest city, update state.
   * Resolves with the { slug, name, userLat, userLng } object on success.
   */
  function requestLocation(cities) {
    setLocating(true);
    setLocError("");
    return getNearestCity(cities)
      .then((nearCity) => {
        setLocating(false);
        setUserLat(nearCity.userLat);
        setUserLng(nearCity.userLng);
        setNearMeActive(true);
        return nearCity;
      })
      .catch((err) => {
        setLocating(false);
        setLocError(err);
        throw err;
      });
  }

  /** Reset all near me state. */
  function clearNearMe() {
    setNearMeActive(false);
    setUserLat(null);
    setUserLng(null);
    setLocError("");
  }

  return { locating, locError, nearMeActive, userLat, userLng, requestLocation, clearNearMe };
}

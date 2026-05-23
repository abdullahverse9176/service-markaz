"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getNearestCity } from "@/utils/geolocation";

const LocationContext = createContext(null);

const SESSION_KEY = "sm_location";

/**
 * LocationProvider — wraps the app and provides a single shared user-location
 * state that all sections can consume via `useLocation()`.
 *
 * Behaviour:
 *  - On mount: restores from sessionStorage (same-session cache, no extra GPS call).
 *  - If not cached: checks Permissions API — if already "granted", silently detects
 *    without showing any permission dialog (safe on Android Chrome).
 *  - `requestLocation(cities)`: user-initiated call (e.g. "Use My Location" button).
 *    Shows the permission dialog, updates context + sessionStorage cache.
 *  - `clearLocation()`: resets everything and removes the session cache.
 *
 * `nearMeActive` is only true when the user EXPLICITLY clicked the button.
 * Silent auto-detection sets lat/lng but keeps nearMeActive = false, so UI
 * badges ("Active") won't appear unless the user opted in.
 */
export function LocationProvider({ children }) {
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [citySlug, setCitySlug] = useState(null);
  const [cityName, setCityName] = useState(null);
  // true only when user explicitly clicked "Use My Current Location"
  const [nearMeActive, setNearMeActive] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  useEffect(() => {
    // ── Step 1: restore from session cache ──────────────────────────────────
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) {
        const d = JSON.parse(cached);
        setUserLat(d.lat);
        setUserLng(d.lng);
        if (d.citySlug) setCitySlug(d.citySlug);
        if (d.cityName) setCityName(d.cityName);
        // Restore nearMeActive so the hero button stays highlighted across navigations
        if (d.nearMeActive) setNearMeActive(true);
        return; // no GPS call needed
      }
    } catch { /* sessionStorage unavailable (private mode etc.) */ }

    // ── Step 2: silently detect if permission already granted ───────────────
    if (!navigator?.permissions || !navigator?.geolocation) return;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              setUserLat(lat);
              setUserLng(lng);
              try {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify({ lat, lng }));
              } catch { /* ignore */ }
            },
            () => { /* silent failure — no error shown */ },
            { timeout: 8000, maximumAge: 60_000 }
          );
        }
        // "denied" — do nothing
      })
      .catch(() => { /* Permissions API not supported — skip silently */ });
  }, []);

  /**
   * User-initiated location request.
   * Triggers the browser permission dialog if not yet granted.
   * @param {{ slug: string, name: string }[]} cities — for nearest-city lookup
   */
  const requestLocation = useCallback((cities) => {
    setLocating(true);
    setLocError("");
    return getNearestCity(cities)
      .then((nearCity) => {
        setLocating(false);
        setUserLat(nearCity.userLat);
        setUserLng(nearCity.userLng);
        setCitySlug(nearCity.slug);
        setCityName(nearCity.name);
        setNearMeActive(true);
        try {
          sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
              lat: nearCity.userLat,
              lng: nearCity.userLng,
              citySlug: nearCity.slug,
              cityName: nearCity.name,
              nearMeActive: true,
            })
          );
        } catch { /* ignore */ }
        return nearCity;
      })
      .catch((err) => {
        setLocating(false);
        setLocError(err);
        throw err;
      });
  }, []);

  /** Reset all location state and remove session cache. */
  const clearLocation = useCallback(() => {
    setUserLat(null);
    setUserLng(null);
    setCitySlug(null);
    setCityName(null);
    setNearMeActive(false);
    setLocError("");
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLat,
        userLng,
        citySlug,
        cityName,
        nearMeActive,
        locating,
        locError,
        requestLocation,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Consume the shared location context.
 * Must be used inside <LocationProvider>.
 */
export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within <LocationProvider>");
  return ctx;
}

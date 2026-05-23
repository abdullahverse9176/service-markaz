"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons broken by webpack/Next.js
function fixLeafletIcons(L) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Constants outside component — not redefined on every render
const DEFAULT_CENTER = [30.3753, 69.3451]; // Pakistan center
const DEFAULT_ZOOM = 5;
const MARKER_ZOOM = 14;

/**
 * Interactive Leaflet map location picker.
 * Provider can drag the pin or click "Use Current Location".
 *
 * Props:
 *   value: { lat: number, lng: number } | null
 *   onChange: (coords: { lat: number, lng: number } | null) => void
 */
export default function LocationPicker({ value, onChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  // Always holds the latest value — lets the async map-init callback see it even if
  // it resolves after the parent has already updated value (edit-business pre-fill race)
  const latestValueRef = useRef(value);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  // Keep ref in sync with prop on every render
  latestValueRef.current = value;

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    // `cancelled` prevents the async Leaflet import from initialising the map
    // after the effect has already been cleaned up (React Strict Mode fires
    // effects twice in dev, which causes "Map container already initialized").
    let cancelled = false;

    // Dynamic import — Leaflet is browser-only
    import("leaflet").then((L) => {
      if (cancelled || mapRef.current || !mapContainerRef.current) return;

      fixLeafletIcons(L);

      // Use ref so we get the value that may have arrived after mount (edit-business)
      const initialValue = latestValueRef.current;
      const initialCenter = initialValue ? [initialValue.lat, initialValue.lng] : DEFAULT_CENTER;
      const initialZoom = initialValue ? MARKER_ZOOM : DEFAULT_ZOOM;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Place initial marker if value exists (covers both fresh load and pre-fill)
      if (initialValue) {
        const marker = L.marker([initialValue.lat, initialValue.lng], { draggable: true }).addTo(map);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          onChange({ lat: +pos.lat.toFixed(7), lng: +pos.lng.toFixed(7) });
        });
        markerRef.current = marker;
      }

      // Click on map to place/move marker
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        const coords = { lat: +lat.toFixed(7), lng: +lng.toFixed(7) };

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          import("leaflet").then((L2) => {
            const marker = L2.marker([lat, lng], { draggable: true }).addTo(map);
            marker.on("dragend", () => {
              const pos = marker.getLatLng();
              onChange({ lat: +pos.lat.toFixed(7), lng: +pos.lng.toFixed(7) });
            });
            markerRef.current = marker;
          });
        }
        onChange(coords);
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g., pre-fill from edit form)
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      if (value) {
        if (markerRef.current) {
          markerRef.current.setLatLng([value.lat, value.lng]);
        } else {
          const marker = L.marker([value.lat, value.lng], { draggable: true }).addTo(mapRef.current);
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onChange({ lat: +pos.lat.toFixed(7), lng: +pos.lng.toFixed(7) });
          });
          markerRef.current = marker;
        }
        mapRef.current.setView([value.lat, value.lng], MARKER_ZOOM);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocError("Your browser does not support location.");
      return;
    }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: +pos.coords.latitude.toFixed(7),
          lng: +pos.coords.longitude.toFixed(7),
        };
        setLocating(false);
        onChange(coords);

        import("leaflet").then((L) => {
          if (!mapRef.current) return;
          if (markerRef.current) {
            markerRef.current.setLatLng([coords.lat, coords.lng]);
          } else {
            const marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(mapRef.current);
            marker.on("dragend", () => {
              const p = marker.getLatLng();
              onChange({ lat: +p.lat.toFixed(7), lng: +p.lng.toFixed(7) });
            });
            markerRef.current = marker;
          }
          mapRef.current.setView([coords.lat, coords.lng], MARKER_ZOOM);
        });
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocError("Location permission denied. Please allow access.");
        else if (err.code === 3) setLocError("Location request timed out. Try again.");
        else setLocError("Unable to get your location.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  return (
    <div className="space-y-3">
      {/* Use Current Location button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {locating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Navigation size={16} />
        )}
        {locating ? "Getting location…" : "Use Current Location"}
      </button>

      {locError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <MapPin size={12} /> {locError}
        </p>
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 z-0"
        style={{ minHeight: "256px" }}
      />

      {/* Coordinates display */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
        <MapPin size={13} className={value ? "text-blue-500" : "text-gray-300"} />
        {value ? (
          <span className="font-mono">
            {value.lat.toFixed(5)}°N, {value.lng.toFixed(5)}°E
          </span>
        ) : (
          <span className="text-gray-400 italic">
            Click on the map or use &quot;Use Current Location&quot; to set your location
          </span>
        )}
      </div>
    </div>
  );
}

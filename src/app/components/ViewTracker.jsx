"use client";

import { useEffect } from "react";

/**
 * Silently fires a view event for the given business once per browser session.
 * Renders nothing — purely a side-effect component.
 */
export default function ViewTracker({ businessId }) {
  useEffect(() => {
    if (!businessId) return;

    // Deduplicate: only count one view per hour per business per tab
    const key = `sm_viewed_${businessId}`;
    const last = sessionStorage.getItem(key);
    const ONE_HOUR = 60 * 60 * 1000;
    if (last && Date.now() - Number(last) < ONE_HOUR) return;
    sessionStorage.setItem(key, String(Date.now()));

    fetch(`/api/businesses/${businessId}/view`, { method: "POST" }).catch(() => {
      // Silently ignore — tracking should never break the page
    });
  }, [businessId]);

  return null;
}

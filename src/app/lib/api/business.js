/**
 * Client-side API wrappers for business listing endpoints.
 * All write/read operations require a JWT token.
 */

export async function createBusiness(data, token) {
  const res = await fetch("/api/business", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create business listing");
  return json.data;
}

export async function getMyBusiness(token) {
  const res = await fetch("/api/business", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch business listing");
  return json.data;
}

export async function updateBusiness(data, token) {
  const res = await fetch("/api/business", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update business listing");
  return json.data;
}

export async function updateAvailability(availability, token) {
  const res = await fetch("/api/business", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ availability }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update availability");
  return json.data;
}

export async function uploadImage(file, folder, token) {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Image upload failed");
  return json.data.url;
}

export async function getBusinessAnalytics(token) {
  const res = await fetch("/api/business/analytics", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch analytics");
  return json.data;
}

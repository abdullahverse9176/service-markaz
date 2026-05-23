// GET /api/leads?businessId=xxx — fetch current user's lead for a business
export async function getLead(businessId, token) {
  const res = await fetch(`/api/leads?businessId=${businessId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch lead");
  return data.data; // null or lead object
}

// POST /api/leads — upsert a lead (contact tracking)
export async function trackLead(businessId, source, token) {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ businessId, source }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to track lead");
  return data.data;
}

// PATCH /api/leads/confirm — customer confirms or denies deal (response: "yes" | "no")
export async function confirmDeal(businessId, token, response = "yes") {
  const res = await fetch("/api/leads/confirm", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ businessId, response }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to confirm deal");
  return data.data;
}

// GET /api/leads/received — provider fetches all leads for their business
export async function getReceivedLeads(token) {
  const res = await fetch("/api/leads/received", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch leads");
  return data.data;
}

// PATCH /api/leads/provider-respond — provider confirms, rejects, or disputes a lead
// action: "confirmed" | "rejected" | "disputed"
export async function respondToLead(leadId, action, token) {
  const res = await fetch("/api/leads/provider-respond", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ leadId, action }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to respond to lead");
  return data.data;
}

export async function getReviews(businessId, page = 1) {
  const res = await fetch(
    `/api/businesses/${businessId}/reviews?page=${page}&limit=10`
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to load reviews");
  return data.data;
}

export async function addReview(businessId, { rating, comment }, token) {
  const res = await fetch(`/api/businesses/${businessId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to submit review");
  return data.data;
}

import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/app/lib/api/reviews";

export function useReviews(businessId) {
  return useQuery({
    queryKey: ["reviews", businessId],
    queryFn: () => getReviews(businessId),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

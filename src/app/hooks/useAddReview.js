import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addReview } from "@/app/lib/api/reviews";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "react-hot-toast";

export function useAddReview(businessId) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rating, comment }) =>
      addReview(businessId, { rating, comment }, token),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews", businessId] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit review");
    },
  });
}

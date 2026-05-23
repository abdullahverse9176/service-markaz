import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLead, trackLead, confirmDeal } from "@/app/lib/api/leads";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "react-hot-toast";

// Fetch current user's lead status for a specific business
export function useLeadStatus(businessId) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["lead", businessId],
    queryFn: () => getLead(businessId, token),
    enabled: !!businessId && !!token,
  });
}

// Fire-and-forget contact tracking — no toast, non-blocking
export function useTrackLead(businessId) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (source) => {
      if (!businessId || !token) return Promise.resolve(null);
      return trackLead(businessId, source, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", businessId] });
    },
  });
}

// Customer confirms or denies that a deal happened
export function useConfirmDeal(businessId) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (response) => confirmDeal(businessId, token, response),
    onSuccess: (data) => {
      // Update cache immediately from the mutation response — UI changes NOW,
      // no need to wait for the background refetch to complete.
      if (data) {
        queryClient.setQueryData(["lead", businessId], data);
      }
      // Also invalidate so we get a fresh server copy in the background
      queryClient.invalidateQueries({ queryKey: ["lead", businessId] });

      const status = data?.status;
      if (status === "confirmed") toast.success("Deal confirmed! You can now leave a review.");
      else toast.success("Response recorded.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to record response");
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReceivedLeads, respondToLead } from "@/app/lib/api/leads";
import { useAuth } from "@/app/context/AuthContext";

// Fetch all leads/enquiries created by the current customer
export function useMyLeads() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["leads", "my"],
    queryFn: async () => {
      const res = await fetch("/api/leads/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch enquiries");
      return data.data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useReceivedLeads() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["leads", "received"],
    queryFn: () => getReceivedLeads(token),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Provider responds to a lead (confirmed / rejected / disputed)
export function useProviderRespondToLead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, action }) => respondToLead(leadId, action, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", "received"] });
    },
  });
}

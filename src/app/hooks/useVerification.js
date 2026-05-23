import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/context/AuthContext";

/**
 * Custom hook to fetch verification status for the logged-in provider's business.
 * Returns verification data including status, documents, and review details.
 */
export function useVerification() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["verification-status"],
    queryFn: async () => {
      const res = await fetch("/api/verification", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch verification status");
      }

      const data = await res.json();
      return data.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

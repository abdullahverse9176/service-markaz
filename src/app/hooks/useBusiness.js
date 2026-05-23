import { useQuery } from "@tanstack/react-query";
import { getMyBusiness, getBusinessAnalytics } from "@/app/lib/api/business";
import { useAuth } from "@/app/context/AuthContext";

export function useBusiness() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["my-business"],
    queryFn: () => getMyBusiness(token),
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBusinessAnalytics() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["business-analytics"],
    queryFn: () => getBusinessAnalytics(token),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

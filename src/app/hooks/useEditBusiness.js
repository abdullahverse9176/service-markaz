import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateBusiness } from "@/app/lib/api/business";
import { useAuth } from "@/app/context/AuthContext";

export function useEditBusiness() {
  const { token } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateBusiness(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
      router.push("/provider-profile");
    },
  });
}

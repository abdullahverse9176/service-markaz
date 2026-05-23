import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createBusiness } from "@/app/lib/api/business";
import { useAuth } from "@/app/context/AuthContext";

export function useAddBusiness() {
  const { token, updateUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (data) => createBusiness(data, token),
    onSuccess: () => {
      // Immediately sync role in AuthContext + localStorage so the Navbar
      // switches to provider mode without requiring a logout/login cycle.
      updateUser({ role: "provider" });
      router.push("/provider-profile");
    },
  });
}

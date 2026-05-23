import { useMutation } from "@tanstack/react-query";
import { verifyOtp } from "@/app/lib/api/auth";
import { useAuth } from "@/app/context/AuthContext";

export function useVerifyOtp() {
  const { token, updateUser } = useAuth();

  return useMutation({
    mutationFn: (otp) => verifyOtp({ otp, token }),
    onSuccess: () => {
      // Persist the verified state in the auth context / localStorage
      updateUser({ isEmailVerified: true });
    },
  });
}

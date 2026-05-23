import { useMutation } from "@tanstack/react-query";
import { verifyForgotPasswordOtp } from "@/app/lib/api/auth";

export function useVerifyForgotOtp() {
  return useMutation({
    mutationFn: verifyForgotPasswordOtp,
  });
}

import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/app/lib/api/auth";

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

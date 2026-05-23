import { useMutation } from "@tanstack/react-query";
import { signUp } from "@/app/lib/api/auth";

export function useSignUp() {
  return useMutation({
    mutationFn: signUp,
  });
}

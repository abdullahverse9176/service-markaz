import { useMutation } from "@tanstack/react-query";
import { sendOtp } from "@/app/lib/api/auth";
import { useAuth } from "@/app/context/AuthContext";

export function useSendOtp() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: () => sendOtp(token),
  });
}

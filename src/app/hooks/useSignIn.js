import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signIn } from "@/app/lib/api/auth";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "react-hot-toast";

export function useSignIn({ redirectTo } = {}) {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      login(data);
      if (data?.user?.isEmailVerified === false) {
        toast("Please verify your email for full access.", {
          icon: "⚠️",
          style: { background: "#fffbeb", border: "1px solid #fbbf24", color: "#92400e" },
        });
      } else {
        toast.success("Signed in successfully!");
      }
      router.push(redirectTo || "/");
    },
  });
}

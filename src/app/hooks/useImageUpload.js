import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { uploadImage } from "@/app/lib/api/business";
import { useAuth } from "@/app/context/AuthContext";

export function useImageUpload(folder = "service-markaz/businesses") {
  const { token } = useAuth();
  // Keep token in a ref so mutationFn always reads the latest value
  // even if the closure was captured before auth loaded from localStorage
  const tokenRef = useRef(token);
  tokenRef.current = token;

  return useMutation({
    mutationFn: (file) => uploadImage(file, folder, tokenRef.current),
  });
}

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getIconComponent } from "@/utils/iconMap";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get("/api/categories");
      // Transform icon strings to components
      return data.data.map((category) => ({
        ...category,
        icon: getIconComponent(category.icon),
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

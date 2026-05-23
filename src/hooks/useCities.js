import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useCities = () => {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data } = await axios.get("/api/cities");
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

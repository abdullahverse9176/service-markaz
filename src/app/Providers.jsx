"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/app/context/AuthContext";
import { LocationProvider } from "@/app/context/LocationContext";

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep data fresh for 1 minute before triggering background refetch
            staleTime: 60_000,
            // Only retry once on failure (default is 3 — wastes time in serverless)
            retry: 1,
            // Don't refetch just because the user switched browser tabs
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <LocationProvider>
          <AuthProvider>{children}</AuthProvider>
        </LocationProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không tự động fetch lại data khi focus vào window
      refetchOnReconnect: false, // Không tự động fetch khi có kết nối internet trở lại
      refetchOnMount: false, // Không tự động fetch khi component được mount
    },
  },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

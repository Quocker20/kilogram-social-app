import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
      retry: 1,                 // Retry failed requests once
      refetchOnWindowFocus: false,
    },
  },
});
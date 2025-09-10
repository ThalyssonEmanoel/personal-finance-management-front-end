"use client";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Não fazer retry para erros 404 (usuário novo sem transações)
        if (error?.message?.includes('404') || error?.status === 404) {
          return false;
        }
        // Para outros erros, fazer retry máximo de 1 vez
        return failureCount < 1;
      },
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})

export default function ReactQueryProvider({ children }) {

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

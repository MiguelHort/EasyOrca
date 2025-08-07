// lib/hooks/useUser.ts
import useSWR from 'swr'

export function useUser() {
  const { data, error, isLoading } = useSWR('/api/user')

  return {
    user: data,
    isLoading,
    isError: !!error,
    errorMessage: error?.message,
  }
}

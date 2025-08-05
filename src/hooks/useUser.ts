// lib/hooks/useUser.ts
import useSWR from 'swr'

export function useUser() {
  const { data, error, isLoading } = useSWR('/api/infoUser')

  return {
    user: data,
    isLoading,
    isError: !!error,
    errorMessage: error?.message,
  }
}

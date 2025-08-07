// lib/hooks/useCompany.ts
import useSWR from 'swr'

export function useCompany() {
  const { data, error, isLoading } = useSWR('/api/company')

  return {
    company: data,
    isLoading,
    isError: !!error,
    errorMessage: error?.message,
  }
}

'use client'

import dynamic from 'next/dynamic'
import {
  ThemeProvider as StaticProvider,
  type ThemeProviderProps,
} from 'next-themes'
import * as React from 'react'
const DynProvider = dynamic(
  () => import('next-themes').then((e) => e.ThemeProvider),
  {
    ssr: false,
  },
)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const NextThemeProvider =
    process.env.NODE_ENV === 'production' ? StaticProvider : DynProvider
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>
}
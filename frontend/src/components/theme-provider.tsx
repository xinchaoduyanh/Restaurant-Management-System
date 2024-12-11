"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// ThemeProvider là một wrapper component để quản lý theme trong ứng dụng
// - Nhận vào children và các props khác từ NextThemesProvider
// - Sử dụng next-themes để xử lý việc chuyển đổi theme (light/dark mode)
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

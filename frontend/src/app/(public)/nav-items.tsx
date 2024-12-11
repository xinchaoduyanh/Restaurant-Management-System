'use client'

import { getAccessTokenFromLocalStorage } from '@/lib/utils'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const menuItems = [
  {
    title: 'Món ăn',
    href: '/menu',

  },
  {
    title: 'Đơn hàng',
    href: '/orders',

  },
  {
    title: 'Đăng nhập',
    href: '/login',
    authRequired: false
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    authRequired: true
  }
]

export default function NavItems({ className }: { className?: string }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  useEffect(() => {
    setIsAuthenticated(Boolean(getAccessTokenFromLocalStorage()))
  }, [])
  

  return menuItems.map((item) => {
    if (item.authRequired && !isAuthenticated) return null
    return (
      <Link href={item.href} key={item.href} className={className}>
        {item.title}
      </Link>
    )
  })
}

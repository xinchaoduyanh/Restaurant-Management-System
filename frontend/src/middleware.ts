import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
const privatePaths = ['/manage']
const unAuthPaths = ['/login', '/register']


// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl
  const isLogin = Boolean(request.cookies.get('access_token')?.value)
  //Chua dang nhap thi k cho vao privatePaths
  if (!isLogin && privatePaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  //Dang nhap roi thi k cho vao unAuthPaths
  if (isLogin && unAuthPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/', request.url))
  }



  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/manage/:path*', '/login', '/register']
}
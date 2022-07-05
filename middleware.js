import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export const middleware = withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.roles?.includes('admin')
    const pathname = req.nextUrl.pathname

    if (
      pathname.startsWith('/pending') ||
      pathname.startsWith('/stats') ||
      pathname.startsWith('/queued') ||
      pathname.startsWith('/lp')
    ) {
      if (!token) {
        return NextResponse.redirect(new URL('/', req.url))
      } else if (!isAdmin) {
        return NextResponse.rewrite(new URL('/unauthorized', req.url))
      }
    }

    if (!isAdmin && (
      pathname.startsWith('/api/v1/swap/bonded') ||
      pathname.startsWith('/api/v1/swap/locked') ||
      pathname.startsWith('/api/v1/swap/conflict') ||
      pathname.startsWith('/api/v1/rules') ||
      // pathname.startsWith('/api/v1/stats') ||
      pathname.startsWith('/api/v1/queued')
    )) {
      return NextResponse.rewrite(new URL('/api/401', req.url))
    }
  },
  {
    callbacks: {
      authorized: () => true
    }
  }
)

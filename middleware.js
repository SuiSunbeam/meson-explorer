import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export const middleware = withAuth(
  async function middleware(req) {
    if (process.env.NODE_ENV === 'production') {
      if (req.headers.get('x-forwarded-proto') !== 'https') {
        return NextResponse.redirect(
          `https://${req.headers.get('host')}${req.nextUrl.pathname}`,
          301
        )
      }
    }

    const token = req.nextauth.token
    const isAdmin = token?.roles?.includes('admin')
    const pathname = req.nextUrl.pathname

    if (
      pathname.startsWith('/lp') ||
      pathname.startsWith('/stats') ||
      pathname.startsWith('/pending') ||
      pathname.startsWith('/queued')
    ) {
      if (!token) {
        return NextResponse.redirect(new URL('/', req.url))
      } else if (!isAdmin) {
        return NextResponse.rewrite(new URL('/unauthorized', req.url))
      }
    }

    if (!isAdmin && (
      pathname.startsWith('/api/v1/admin') ||
      pathname.startsWith('/api/v1/rules') ||
      // pathname.startsWith('/api/v1/stats') ||
      pathname.startsWith('/api/v1/swap/bonded') ||
      pathname.startsWith('/api/v1/swap/locked') ||
      pathname.startsWith('/api/v1/swap/conflict') ||
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

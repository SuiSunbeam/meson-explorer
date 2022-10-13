import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

const { NODE_ENV } = process.env

const getApiAccessRoles = pathname => {
  if (
    pathname.startsWith('/api/v1/swap/bonded') ||
    pathname.startsWith('/api/v1/swap/locked') ||
    pathname.startsWith('/api/v1/swap/conflict')
  ) {
    return ['root']
  } else if (
    pathname.startsWith('/api/v1/admin/premium')
  ) {
    return ['operator', 'admin', 'root']
  } else if (
    pathname.startsWith('/api/v1/admin') ||
    pathname.startsWith('/api/v1/stats')
  ) {
    return ['admin', 'root']
  } 
}

const getPageAccessRoles = pathname => {
  if (
    pathname.startsWith('/pending')
  ) {
    return ['root']
  } else if (
    pathname.startsWith('/lp') ||
    pathname.startsWith('/stats') ||
    pathname.startsWith('/premium/stats')
  ) {
    return ['admin', 'root']
  } else if (
    pathname.startsWith('/premium')
  ) {
    return ['operator', 'admin', 'root']
  }
}

export const middleware = withAuth(
  async function middleware(req) {
    if (NODE_ENV === 'production' && req.headers.get('x-forwarded-proto') !== 'https') {
      return NextResponse.redirect(`https://${req.headers.get('host')}${req.nextUrl.pathname}`)
    }

    const token = req.nextauth.token
    const roles = token?.roles || []
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/api/v1')) {
      const apiRoles = getApiAccessRoles(pathname)
      if (apiRoles && !apiRoles.some(r => roles.includes(r))) {
        return NextResponse.rewrite(new URL('/api/401', req.url))
      }
    } else {
      const pageRoles = getPageAccessRoles(pathname)
      if (pageRoles) {
        if (!token) {
          return NextResponse.redirect(new URL('/', req.url))
        } else if (!pageRoles.some(r => roles.includes(r))) {
          return NextResponse.rewrite(new URL('/unauthorized', req.url))
        }
      }
    }
  },
  {
    callbacks: {
      authorized: () => true
    }
  }
)

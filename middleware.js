import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/api/v1/swap/bonded',
    '/api/v1/swap/locked',
    '/api/v1/swap/conflict',
    '/api/v1/stats/:path*',
    '/api/v1/queued/:path*'
  ]
}

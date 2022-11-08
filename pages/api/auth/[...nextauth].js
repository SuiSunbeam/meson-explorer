import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import mongo from 'lib/db/mongo'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  ],
  adapter: MongoDBAdapter(mongo),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 3600,
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.roles = token.roles
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.roles = user.roles
      }
      return token
    }
  }
})

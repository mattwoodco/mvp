import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { magicLink } from 'better-auth/plugins/magic-link'
import { db } from '@mvp/database/server'

export const createAuth = (config: {
  sendMagicLink: (params: { email: string; token: string; url: string }) => Promise<void>
}) => {
  return betterAuth({
    baseURL: process.env.NEXT_PUBLIC_SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    socialProviders: {
      google: {
        clientId: process.env.AUTH_GOOGLE_ID!,
        clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: config.sendMagicLink,
      }),
      nextCookies(),
    ],
  })
}
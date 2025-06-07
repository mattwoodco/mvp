import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest } from 'next/server'

export function getSessionFromRequest(request: NextRequest) {
  return getSessionCookie(request)
}
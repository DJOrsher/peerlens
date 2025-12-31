import { redirect } from 'next/navigation'
import { requireAuth } from './actions/auth'

/**
 * Get admin emails from environment variable
 * Format: ADMIN_EMAILS=admin@example.com,other@example.com
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Check if an email is an admin
 */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}

/**
 * Require admin access - redirects to dashboard if not admin
 * Use this in admin pages and server actions
 */
export async function requireAdmin() {
  const user = await requireAuth()

  if (!isAdmin(user.email)) {
    redirect('/dashboard')
  }

  return user
}

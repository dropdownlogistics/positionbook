import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

/**
 * Resolves the signed-in Clerk user and guarantees a matching User row exists.
 *
 * `User.id` has no default — it is the Clerk user id. Nothing previously
 * created that row, so a real Clerk sign-up would FK-fail on its first write.
 * The upsert here is the just-in-time fix; a Clerk `user.created` webhook is
 * the durable one and is still owed.
 *
 * Returns null when there is no session. Callers should 401 on null.
 */
export async function requireUserId(): Promise<string | null> {
  const { userId } = await auth()
  if (!userId) return null

  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (existing) return userId

  const clerkUser = await currentUser()
  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${userId}@positionbook.local`

  // Concurrent first requests can race here; treat "already exists" as success.
  try {
    await prisma.user.create({ data: { id: userId, email } })
  } catch {
    const now = await prisma.user.findUnique({ where: { id: userId } })
    if (!now) throw new Error(`Could not provision User row for ${userId}`)
  }

  return userId
}

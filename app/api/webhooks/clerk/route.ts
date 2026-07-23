import { verifyWebhook } from "@clerk/nextjs/webhooks"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Durable User provisioning.
 *
 * `requireUserId()` in lib/auth.ts upserts a User row just-in-time on the
 * first authenticated request. That works, but it only fires when the user
 * happens to hit an API route. This webhook is the authoritative path: Clerk
 * tells us the moment an account is created or its email changes.
 *
 * Requires CLERK_WEBHOOK_SIGNING_SECRET in the environment, and an endpoint
 * configured in the Clerk dashboard pointing at /api/webhooks/clerk for the
 * user.created and user.updated events. Until both exist this route returns
 * 400 on every call — harmless, since the JIT upsert still covers provisioning.
 *
 * This route is public in middleware.ts: Clerk signs the request rather than
 * carrying a session. verifyWebhook() is what authenticates it — an unsigned
 * or wrongly-signed body is rejected before any database access.
 */
export async function POST(req: NextRequest) {
  let evt
  try {
    evt = await verifyWebhook(req)
  } catch (error) {
    console.error("CLERK WEBHOOK VERIFY FAILED:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const id = evt.data.id
      const primaryId = evt.data.primary_email_address_id
      const emails = evt.data.email_addresses ?? []
      const email =
        emails.find(e => e.id === primaryId)?.email_address ??
        emails[0]?.email_address ??
        `${id}@positionbook.local`

      await prisma.user.upsert({
        where: { id },
        update: { email },
        create: { id, email },
      })
      console.log(`CLERK WEBHOOK: ${evt.type} provisioned ${id}`)
    }

    // user.deleted is intentionally not handled. Position.userId is a
    // RESTRICT foreign key, so removing a user with positions would throw,
    // and cascading the delete would destroy trade history on an external
    // signal. Deletion stays a deliberate, manual operation.

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("CLERK WEBHOOK HANDLER ERROR:", error)
    return NextResponse.json({ error: "Handler failed" }, { status: 500 })
  }
}

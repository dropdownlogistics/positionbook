import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// The Clerk webhook carries a signature, not a session, so it cannot pass
// auth.protect(). It authenticates itself via verifyWebhook() in the handler.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
])

const isApiRoute = createRouteMatcher(["/api/(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return

  // API routes must fail as APIs. Redirecting them to /sign-in hands the
  // caller an HTML page where JSON is expected, so fetch() sees a 200 of
  // markup instead of an auth failure.
  if (isApiRoute(request)) {
    await auth.protect()
    return
  }

  // Pages redirect to sign-in rather than returning a bare 404.
  await auth.protect({ unauthenticatedUrl: new URL("/sign-in", request.url).toString() })
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}

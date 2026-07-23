import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// The Clerk webhook carries a signature, not a session, so it cannot pass
// auth.protect(). It authenticates itself via verifyWebhook() in the handler.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // Send signed-out visitors to sign-in rather than returning a bare 404.
    await auth.protect({ unauthenticatedUrl: new URL("/sign-in", request.url).toString() })
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}

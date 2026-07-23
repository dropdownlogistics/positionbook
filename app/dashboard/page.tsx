import { redirect } from "next/navigation"

// Dashboard is offline pending the public-demo rebuild (mock dataset, no auth)
// per DECISION-AUTH-20260723. Redirects to the landing page until then.
export default function DashboardPage() {
  redirect("/")
}

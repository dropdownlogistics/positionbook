import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#060e14" }}>
      <SignIn />
    </div>
  )
}

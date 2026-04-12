import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#060e14" }}>
      <SignUp />
    </div>
  )
}

import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const user = await getSession()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/gamelogo.png" alt="Battle of Codes" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to continue your coding journey</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

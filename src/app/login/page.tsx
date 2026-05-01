"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircleIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  notifyAuthChanged,
  sanitizePostLoginRedirect,
  ZENMARKET_TOKEN_KEY,
  ZENMARKET_USER_KEY,
} from "@/lib/auth"
import { loginUser } from "@/services/authService"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = {
  email?: string
  password?: string
}

function validateClient(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  const e = email.trim()
  if (!e) {
    errors.email = "Email is required."
  } else if (!EMAIL_REGEX.test(e)) {
    errors.email = "Enter a valid email address."
  }
  if (!password) {
    errors.password = "Password is required."
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters."
  }
  return errors
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const trimmedEmail = email.trim()
    const clientErrors = validateClient(trimmedEmail, password)
    setFieldErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) {
      return
    }

    setPending(true)
    try {
      const result = await loginUser({
        email: trimmedEmail,
        password,
      })

      if (result.success) {
        localStorage.setItem(ZENMARKET_TOKEN_KEY, result.data.token)
        localStorage.setItem(ZENMARKET_USER_KEY, JSON.stringify(result.data.user))
        notifyAuthChanged()
        setPassword("")
        const next = sanitizePostLoginRedirect(searchParams.get("redirect"))
        router.push(next)
        router.refresh()
        return
      }

      setFormError(result.message || "Invalid credentials.")
      const next: FieldErrors = {}
      if (result.errors) {
        for (const [key, msgs] of Object.entries(result.errors)) {
          const first = msgs?.[0]
          if (first && (key === "email" || key === "password")) {
            next[key] = first
          }
        }
      }
      setFieldErrors((prev) => ({ ...prev, ...next }))
      setPassword("")
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
      setPassword("")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-muted/40 via-background to-background py-10 md:py-12">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-4">
        <Card className="border-border/80 shadow-lg">
          <CardHeader className="space-y-1 pb-4 text-center sm:text-left">
            <CardTitle className="font-heading text-2xl tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription>
              Login to continue shopping with ZenMarket.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircleIcon aria-hidden />
                <AlertTitle>Could not sign in</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => {
                    setEmail(ev.target.value)
                    setFieldErrors((f) => ({ ...f, email: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "login-email-error" : undefined
                  }
                  disabled={pending}
                  className="h-10"
                />
                {fieldErrors.email ? (
                  <p
                    id="login-email-error"
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(ev) => {
                    setPassword(ev.target.value)
                    setFieldErrors((f) => ({ ...f, password: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "login-password-error" : undefined
                  }
                  disabled={pending}
                  className="h-10"
                />
                {fieldErrors.password ? (
                  <p
                    id="login-password-error"
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="h-10 w-full"
                disabled={pending}
              >
                {pending ? "Logging in…" : "Login"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              <Link
                href="/products"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Continue browsing without signing in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoginFallback() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-muted/40 via-background to-background py-16">
      <p className="text-sm text-muted-foreground">Loading sign-in…</p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { registerUser } from "@/services/authService"

const VERIFICATION_EMAIL_KEY = "zenmarket_verification_email"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldKey = "name" | "email" | "password" | "password_confirmation"

type FieldErrors = Partial<Record<FieldKey, string>>

function validateClient(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string
): FieldErrors {
  const errors: FieldErrors = {}
  const n = name.trim()
  if (!n) {
    errors.name = "Name is required."
  } else if (n.length < 2) {
    errors.name = "Name must be at least 2 characters."
  }

  const e = email.trim()
  if (!e) {
    errors.email = "Email is required."
  } else if (!EMAIL_REGEX.test(e)) {
    errors.email = "Enter a valid email address."
  }

  if (!password) {
    errors.password = "Password is required."
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters."
  }

  if (!passwordConfirmation) {
    errors.password_confirmation = "Please confirm your password."
  } else if (passwordConfirmation !== password) {
    errors.password_confirmation = "Passwords do not match."
  }

  return errors
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const clientErrors = validateClient(
      trimmedName,
      trimmedEmail,
      password,
      passwordConfirmation
    )
    setFieldErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) {
      return
    }

    setPending(true)
    try {
      const result = await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
        password_confirmation: passwordConfirmation,
      })

      if (result.success) {
        sessionStorage.setItem(VERIFICATION_EMAIL_KEY, trimmedEmail)
        setPassword("")
        setPasswordConfirmation("")
        router.push(`/verify-email?email=${encodeURIComponent(trimmedEmail)}`)
        return
      }

      setFormError(result.message || "Registration failed.")
      const next: FieldErrors = {}
      if (result.errors) {
        for (const key of [
          "name",
          "email",
          "password",
          "password_confirmation",
        ] as const) {
          const msgs = result.errors[key]
          const first = msgs?.[0]
          if (first) next[key] = first
        }
      }
      setFieldErrors((prev) => ({ ...prev, ...next }))
      setPassword("")
      setPasswordConfirmation("")
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
      setPassword("")
      setPasswordConfirmation("")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-muted/40 via-background to-background py-10 md:py-12">
      <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center px-4">
        <Card className="border-border/80 shadow-lg">
          <CardHeader className="space-y-1 pb-4 text-center sm:text-left">
            <CardTitle className="font-heading text-2xl tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription>
              Join ZenMarket and start shopping with confidence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircleIcon aria-hidden />
                <AlertTitle>Registration issue</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="register-name">Name</Label>
                <Input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(ev) => {
                    setName(ev.target.value)
                    setFieldErrors((f) => ({ ...f, name: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? "register-name-error" : undefined
                  }
                  disabled={pending}
                  className="h-10"
                />
                {fieldErrors.name ? (
                  <p
                    id="register-name-error"
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
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
                    fieldErrors.email ? "register-email-error" : undefined
                  }
                  disabled={pending}
                  className="h-10"
                />
                {fieldErrors.email ? (
                  <p
                    id="register-email-error"
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(ev) => {
                    setPassword(ev.target.value)
                    setFieldErrors((f) => ({ ...f, password: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "register-password-error" : undefined
                  }
                  disabled={pending}
                  className="h-10"
                />
                {fieldErrors.password ? (
                  <p
                    id="register-password-error"
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password-confirmation">
                  Confirm password
                </Label>
                <Input
                  id="register-password-confirmation"
                  name="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(ev) => {
                    setPasswordConfirmation(ev.target.value)
                    setFieldErrors((f) => ({
                      ...f,
                      password_confirmation: undefined,
                    }))
                  }}
                  aria-invalid={Boolean(fieldErrors.password_confirmation)}
                  aria-describedby={
                    fieldErrors.password_confirmation
                      ? "register-password-confirmation-error"
                      : undefined
                  }
                  disabled={pending}
                  className="h-10"
                />
                {fieldErrors.password_confirmation ? (
                  <p
                    id="register-password-confirmation-error"
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    {fieldErrors.password_confirmation}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="h-10 w-full"
                disabled={pending}
              >
                {pending ? "Creating account…" : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

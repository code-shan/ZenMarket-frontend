"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react"

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
import { resendOtp, verifyEmail } from "@/services/authService"

const VERIFICATION_EMAIL_KEY = "zenmarket_verification_email"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const OTP_REGEX = /^\d{6}$/

type FieldErrors = {
  email?: string
  otp?: string
}

function validateVerify(email: string, otp: string): FieldErrors {
  const errors: FieldErrors = {}
  const e = email.trim()
  if (!e) {
    errors.email = "Email is required."
  } else if (!EMAIL_REGEX.test(e)) {
    errors.email = "Enter a valid email address."
  }
  const o = otp.trim()
  if (!o) {
    errors.otp = "OTP is required."
  } else if (!OTP_REGEX.test(o)) {
    errors.otp = "Enter the 6-digit code."
  }
  return errors
}

function validateEmailOnly(email: string): FieldErrors {
  const errors: FieldErrors = {}
  const e = email.trim()
  if (!e) {
    errors.email = "Email is required."
  } else if (!EMAIL_REGEX.test(e)) {
    errors.email = "Enter a valid email address."
  }
  return errors
}

function VerifyEmailFallback() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-muted/40 via-background to-background py-10 md:py-12">
      <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center px-4">
        <div className="h-80 animate-pulse rounded-xl border border-border/60 bg-card shadow-lg" />
      </div>
    </div>
  )
}

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [verifyPending, setVerifyPending] = useState(false)
  const [resendPending, setResendPending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const applyEmailFromSources = useCallback(() => {
    const q = searchParams.get("email")
    if (q) {
      try {
        setEmail(decodeURIComponent(q.trim()))
      } catch {
        setEmail(q.trim())
      }
      return
    }
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(VERIFICATION_EMAIL_KEY)
      if (stored) setEmail(stored)
    }
  }, [searchParams])

  useEffect(() => {
    applyEmailFromSources()
  }, [applyEmailFromSources])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [resendCooldown])

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setInfoMessage(null)

    const trimmedEmail = email.trim()
    const trimmedOtp = otp.trim()
    const clientErrors = validateVerify(trimmedEmail, trimmedOtp)
    setFieldErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) {
      return
    }

    setVerifyPending(true)
    try {
      const result = await verifyEmail({
        email: trimmedEmail,
        otp: trimmedOtp,
      })

      if (result.success) {
        sessionStorage.removeItem(VERIFICATION_EMAIL_KEY)
        setVerified(true)
        setFormError(null)
        setInfoMessage(
          "Email verified successfully. You can now login."
        )
        window.setTimeout(() => {
          router.push("/login")
        }, 2800)
        return
      }

      setFormError(result.message || "Verification failed.")
      const next: FieldErrors = {}
      if (result.errors) {
        const em = result.errors.email?.[0]
        const om = result.errors.otp?.[0]
        if (em) next.email = em
        if (om) next.otp = om
      }
      setFieldErrors((prev) => ({ ...prev, ...next }))
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setVerifyPending(false)
    }
  }

  async function handleResend() {
    setFormError(null)
    setInfoMessage(null)

    const trimmedEmail = email.trim()
    const clientErrors = validateEmailOnly(trimmedEmail)
    setFieldErrors((prev) => ({ ...prev, ...clientErrors }))
    if (clientErrors.email) {
      return
    }

    setResendPending(true)
    try {
      const result = await resendOtp({ email: trimmedEmail })

      if (result.success) {
        setInfoMessage(result.message || "OTP has been sent to your email.")
        setResendCooldown(30)
        setFieldErrors((f) => ({ ...f, email: undefined }))
        return
      }

      setFormError(result.message || "Could not resend OTP.")
      const next: FieldErrors = {}
      if (result.errors?.email?.[0]) {
        next.email = result.errors.email[0]
      }
      setFieldErrors((prev) => ({ ...prev, ...next }))
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setResendPending(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-muted/40 via-background to-background py-10 md:py-12">
      <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center px-4">
        <Card className="border-border/80 shadow-lg">
          <CardHeader className="space-y-1 pb-4 text-center sm:text-left">
            <CardTitle className="font-heading text-2xl tracking-tight">
              Verify your email
            </CardTitle>
            <CardDescription>
              Enter the 6-digit OTP sent to your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {verified ? (
              <Alert className="border-primary/30 bg-primary/5">
                <CheckCircle2Icon className="text-primary" aria-hidden />
                <AlertTitle>Verified</AlertTitle>
                <AlertDescription>
                  {infoMessage ??
                    "Email verified successfully. You can now login."}
                </AlertDescription>
              </Alert>
            ) : null}

            {!verified && formError ? (
              <Alert variant="destructive">
                <AlertCircleIcon aria-hidden />
                <AlertTitle>Could not verify</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            {!verified && infoMessage ? (
              <Alert>
                <AlertDescription>{infoMessage}</AlertDescription>
              </Alert>
            ) : null}

            {!verified ? (
              <form className="space-y-5" onSubmit={handleVerify} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="verify-email">Email</Label>
                  <Input
                    id="verify-email"
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
                      fieldErrors.email ? "verify-email-error" : undefined
                    }
                    disabled={verifyPending}
                    className="h-10"
                  />
                  {fieldErrors.email ? (
                    <p
                      id="verify-email-error"
                      className="text-xs font-medium text-destructive"
                      role="alert"
                    >
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verify-otp">OTP</Label>
                  <Input
                    id="verify-otp"
                    name="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(ev) => {
                      const v = ev.target.value.replace(/\D/g, "").slice(0, 6)
                      setOtp(v)
                      setFieldErrors((f) => ({ ...f, otp: undefined }))
                    }}
                    aria-invalid={Boolean(fieldErrors.otp)}
                    aria-describedby={
                      fieldErrors.otp ? "verify-otp-error" : undefined
                    }
                    disabled={verifyPending}
                    className="h-10 font-mono text-lg tracking-widest"
                  />
                  {fieldErrors.otp ? (
                    <p
                      id="verify-otp-error"
                      className="text-xs font-medium text-destructive"
                      role="alert"
                    >
                      {fieldErrors.otp}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="h-10 w-full"
                  disabled={verifyPending}
                >
                  {verifyPending ? "Verifying…" : "Verify Email"}
                </Button>
              </form>
            ) : (
              <Button
                type="button"
                className="h-10 w-full"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Go to Login
              </Button>
            )}

            {!verified ? (
              <div className="border-t border-border/60 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full"
                  disabled={resendPending || resendCooldown > 0}
                  onClick={handleResend}
                >
                  {resendPending
                    ? "Sending…"
                    : resendCooldown > 0
                      ? `Resend available in ${resendCooldown}s`
                      : "Resend OTP"}
                </Button>
              </div>
            ) : null}

            <p className="text-center text-sm text-muted-foreground">
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

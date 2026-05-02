"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Alert, AlertDescription } from "@/components/ui/alert"
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
  AUTH_CHANGED_EVENT,
  getInitialsFromName,
  getStoredUser,
  isAuthenticated,
  notifyAuthChanged,
  ZENMARKET_USER_KEY,
} from "@/lib/auth"
import { getProfile, updateProfile } from "@/services/profileService"

const PHONE_REGEX = /^0[1-9]\d{8}$/

type FieldErrors = {
  name?: string
  phone?: string
  address?: string
}

function validate(name: string, phone: string, address: string): FieldErrors {
  const errors: FieldErrors = {}
  const n = name.trim()
  if (!n) {
    errors.name = "Name is required."
  } else if (n.length < 2) {
    errors.name = "Name must be at least 2 characters."
  }
  const p = phone.trim().replace(/\s+/g, "")
  if (!p) {
    errors.phone = "Phone is required."
  } else if (!PHONE_REGEX.test(p)) {
    errors.phone = "Enter a valid Sri Lankan mobile number (e.g. 0771234567)."
  }
  const a = address.trim()
  if (!a) {
    errors.address = "Address is required."
  }
  return errors
}

function hydrateFormFromUser(u: {
  name: string
  email: string
  phone?: string | null
  address?: string | null
}) {
  return {
    name: u.name ?? "",
    email: u.email ?? "",
    phone: u.phone?.trim() ?? "",
    address: u.address?.trim() ?? "",
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [profileRetrying, setProfileRetrying] = useState(false)

  useEffect(() => {
    function onAuthChange() {
      if (!isAuthenticated()) {
        router.replace("/login?redirect=/profile")
      }
    }
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChange)
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChange)
  }, [router])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?redirect=/profile")
      setReady(true)
      return
    }

    let cancelled = false

    async function loadProfile() {
      setProfileLoadError(null)
      try {
        const user = await getProfile()
        if (cancelled) return
        localStorage.setItem(ZENMARKET_USER_KEY, JSON.stringify(user))
        notifyAuthChanged()
        const h = hydrateFormFromUser(user)
        setName(h.name)
        setEmail(h.email)
        setPhone(h.phone)
        setAddress(h.address)
      } catch (err) {
        if (cancelled) return
        const msg =
          err instanceof Error && err.message.trim() !== ""
            ? err.message.trim()
            : "Failed to load profile."
        setProfileLoadError(msg)
        const cached = getStoredUser()
        if (cached) {
          const h = hydrateFormFromUser(cached)
          setName(h.name)
          setEmail(h.email)
          setPhone(h.phone)
          setAddress(h.address)
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)

    const trimmedName = name.trim()
    const trimmedPhone = phone.trim().replace(/\s+/g, "")
    const trimmedAddress = address.trim()
    const errs = validate(trimmedName, trimmedPhone, trimmedAddress)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setPending(true)
    try {
      const res = await updateProfile({
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
      })
      localStorage.setItem(ZENMARKET_USER_KEY, JSON.stringify(res.data))
      notifyAuthChanged()
      setName(res.data.name)
      setEmail(res.data.email)
      setPhone(res.data.phone?.trim() ?? "")
      setAddress(res.data.address?.trim() ?? "")
      setSuccess("Profile updated successfully.")
    } catch (err) {
      setFormError(
        err instanceof Error && err.message.trim() !== ""
          ? err.message.trim()
          : "Failed to update profile. Please try again."
      )
    } finally {
      setPending(false)
    }
  }

  if (!ready || !isAuthenticated()) {
    return (
      <div className="flex flex-1 flex-col bg-muted/30 py-10 md:py-14">
        <div className="mx-auto w-full max-w-lg px-4 text-sm text-muted-foreground">
          Checking your session…
        </div>
      </div>
    )
  }

  const displayUser = getStoredUser()
  const initials = displayUser
    ? getInitialsFromName(displayUser.name)
    : "?"

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-muted/40 via-background to-background py-10 md:py-14">
      <div className="mx-auto w-full max-w-lg px-4">
        <Card className="border-border/80 shadow-lg">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold tracking-tight text-primary ring-2 ring-primary/20"
                aria-hidden
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <CardTitle className="font-heading text-2xl tracking-tight">
                  My Profile
                </CardTitle>
                <CardDescription className="text-pretty">
                  Manage your personal details for smoother checkout.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {success ? (
              <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            ) : null}
            {profileLoadError ? (
              <Alert variant="destructive">
                <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{profileLoadError}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={profileRetrying}
                    onClick={() => {
                      void (async () => {
                        setProfileRetrying(true)
                        setProfileLoadError(null)
                        try {
                          const user = await getProfile()
                          localStorage.setItem(
                            ZENMARKET_USER_KEY,
                            JSON.stringify(user)
                          )
                          notifyAuthChanged()
                          const h = hydrateFormFromUser(user)
                          setName(h.name)
                          setEmail(h.email)
                          setPhone(h.phone)
                          setAddress(h.address)
                          setProfileLoadError(null)
                        } catch (err) {
                          setProfileLoadError(
                            err instanceof Error && err.message.trim() !== ""
                              ? err.message.trim()
                              : "Failed to load profile."
                          )
                          const cached = getStoredUser()
                          if (cached) {
                            const h = hydrateFormFromUser(cached)
                            setName(h.name)
                            setEmail(h.email)
                            setPhone(h.phone)
                            setAddress(h.address)
                          }
                        } finally {
                          setProfileRetrying(false)
                        }
                      })()
                    }}
                  >
                    {profileRetrying ? "Loading…" : "Retry"}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}

            {formError ? (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="profile-name">Name</Label>
                <Input
                  id="profile-name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(ev) => {
                    setName(ev.target.value)
                    setFieldErrors((f) => ({ ...f, name: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? "profile-name-error" : undefined
                  }
                  disabled={pending}
                  className="h-10"
                />
                {fieldErrors.name ? (
                  <p
                    id="profile-name-error"
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  readOnly
                  disabled
                  className="h-10 bg-muted/80 text-muted-foreground"
                  aria-describedby="profile-email-hint"
                />
                <p id="profile-email-hint" className="text-xs text-muted-foreground">
                  Email cannot be changed from this screen.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  placeholder="0771234567"
                  value={phone}
                  onChange={(ev) => {
                    setPhone(ev.target.value)
                    setFieldErrors((f) => ({ ...f, phone: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={
                    fieldErrors.phone ? "profile-phone-error" : undefined
                  }
                  disabled={pending}
                  className="h-10"
                />
                {fieldErrors.phone ? (
                  <p
                    id="profile-phone-error"
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    {fieldErrors.phone}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-address">Address</Label>
                <Input
                  id="profile-address"
                  name="address"
                  autoComplete="street-address"
                  value={address}
                  onChange={(ev) => {
                    setAddress(ev.target.value)
                    setFieldErrors((f) => ({ ...f, address: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.address)}
                  aria-describedby={
                    fieldErrors.address ? "profile-address-error" : undefined
                  }
                  disabled={pending}
                  className="h-10"
                />
                {fieldErrors.address ? (
                  <p
                    id="profile-address-error"
                    className="text-xs font-medium text-destructive"
                    role="alert"
                  >
                    {fieldErrors.address}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="h-10 w-full" disabled={pending}>
                {pending ? "Saving..." : "Update Profile"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              <Link
                href="/products"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Back to products
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

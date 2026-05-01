import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your email with the OTP sent by ZenMarket.",
}

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

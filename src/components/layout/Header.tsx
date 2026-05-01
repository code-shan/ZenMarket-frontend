import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="rounded-md bg-primary px-2 py-0.5 text-primary-foreground text-sm">
            Zen
          </span>
          <span className="text-foreground">Market</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/#browse"
            className="rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Browse
          </Link>
          <Link
            href="/#sell"
            className="hidden rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
          >
            Sell
          </Link>
          <Link
            href="/products/sample-id"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Sample listing
          </Link>
        </nav>
      </div>
    </header>
  )
}

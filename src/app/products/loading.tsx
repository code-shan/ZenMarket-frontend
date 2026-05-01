import { PageContainer } from "@/components/layout/PageContainer"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <main className="min-h-[60vh] border-b border-border/40 bg-gradient-to-b from-muted/25 to-background pb-16 pt-10 md:pb-24 md:pt-14">
      <PageContainer className="space-y-8 md:space-y-10">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <Skeleton className="mx-auto h-10 w-56 max-w-full md:h-12" />
          <Skeleton className="mx-auto h-5 w-full max-w-xl" />
        </div>

        <div className="space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-full max-w-md" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Skeleton className="h-10 sm:col-span-2" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        <Skeleton className="h-4 w-48" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
            >
              <Skeleton className="aspect-square w-full rounded-none rounded-t-xl" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="mt-auto flex gap-2 border-t bg-muted/30 p-4">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </main>
  )
}

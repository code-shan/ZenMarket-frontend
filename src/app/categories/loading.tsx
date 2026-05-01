import { PageContainer } from "@/components/layout/PageContainer"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoriesLoading() {
  return (
    <main className="min-h-[60vh] border-b border-border/40 bg-gradient-to-b from-muted/30 to-background pb-20 pt-12 md:pb-24 md:pt-16">
      <PageContainer className="space-y-10">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <Skeleton className="mx-auto h-10 w-64 max-w-full md:h-12" />
          <Skeleton className="mx-auto h-5 w-full max-w-lg" />
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <Skeleton className="h-11 w-full max-w-xl rounded-xl md:h-12" />
          <Skeleton className="mx-auto h-4 w-48 shrink-0 sm:mx-0" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
            >
              <Skeleton className="h-48 w-full rounded-none sm:h-52" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </main>
  )
}

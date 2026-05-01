import { PageContainer } from "@/components/layout/PageContainer"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <main className="min-h-[60vh] border-b border-border/50 bg-muted/20 pb-10 pt-8 md:pb-14 md:pt-10">
      <PageContainer>
        <header className="mb-6 text-center lg:mb-8 lg:text-left">
          <Skeleton className="mx-auto h-9 w-48 lg:mx-0" />
          <Skeleton className="mx-auto mt-3 h-4 w-full max-w-xl lg:mx-0 lg:max-w-md" />
        </header>

        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="mb-8 lg:mb-0">
            <div className="space-y-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-full max-w-[200px]" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-4">
            <div className="flex flex-col gap-2 border-b border-border/50 pb-3 sm:flex-row sm:justify-between">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-36" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
          </div>
        </div>
      </PageContainer>
    </main>
  )
}

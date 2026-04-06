export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-12 px-5 py-12">
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-muted/60" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square animate-pulse rounded-3xl bg-muted" />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}

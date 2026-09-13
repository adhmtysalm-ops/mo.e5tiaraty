export function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-xl bg-surface lg:grid-cols-12">
        <div className="aspect-[16/11] animate-pulse bg-elevated lg:col-span-7 lg:aspect-auto lg:min-h-[28rem]" />
        <div className="space-y-4 p-8 lg:col-span-5">
          <div className="h-4 w-24 animate-pulse rounded-full bg-elevated" />
          <div className="h-10 w-full animate-pulse rounded-md bg-elevated" />
          <div className="h-10 w-4/5 animate-pulse rounded-md bg-elevated" />
          <div className="h-16 w-full animate-pulse rounded-md bg-elevated" />
        </div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="h-72 animate-pulse rounded-xl bg-surface" />
        <div className="h-72 animate-pulse rounded-xl bg-surface" />
      </div>
    </div>
  );
}

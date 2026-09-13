import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { FeaturedHero } from "@/components/featured-hero";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { Reveal } from "@/components/reveal";
import { HomeSkeleton } from "@/components/skeletons";
import { loadHome } from "@/lib/wp/api";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { page?: number } => {
    const n = Number(s.page);
    if (Number.isFinite(n) && n > 1) return { page: Math.floor(n) };
    return {};
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ deps }) => loadHome({ data: { page: deps.page } }),
  pendingComponent: HomeSkeleton,
  head: () => ({
    meta: [{ title: "اختياراتي موبايل | أخبار ومراجعات الهواتف" }],
  }),
  component: HomePage,
});

function HomePage() {
  const data = Route.useLoaderData();
  const page = Route.useSearch().page ?? 1;

  return (
    <main id="main" className="mx-auto max-w-[1280px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      {page === 1 && data.featured ? (
        <Reveal>
          <FeaturedHero post={data.featured} />
        </Reveal>
      ) : (
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">الأحدث</h1>
        </header>
      )}

      {data.mosaic.length > 0 ? (
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {data.mosaic.map((post, i) => (
            <Reveal key={post.id} delay={i * 80}>
              <PostCard post={post} variant="mosaic" />
            </Reveal>
          ))}
        </section>
      ) : null}

      {data.rest.length > 0 ? (
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">مختارات هذا الأسبوع</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.rest.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 70}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {!data.featured && data.rest.length === 0 ? (
        <div className="rounded-xl bg-surface px-6 py-16 text-center shadow-[var(--shadow-border)]">
          <p className="text-lg font-medium">لا توجد مقالات بعد.</p>
          <p className="mt-2 text-sm text-muted">عندما تُنشر مقالات جديدة ستظهر هنا مباشرة.</p>
        </div>
      ) : null}

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        to="/"
        searchFor={(p) => ({ page: p })}
      />

      {page === 1 ? (
        <Reveal>
          <aside className="mt-20 overflow-hidden rounded-xl bg-fg p-8 text-bg sm:p-12">
            <p className="text-sm font-medium text-bg/70">من نحن</p>
            <h2 className="mt-3 max-w-[18ch] text-3xl font-semibold tracking-tight sm:text-4xl">
              نختار لك الهاتف المناسب بثقة.
            </h2>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-bg/75">
              اختياراتي موبايل منصة متخصصة في عالم الهواتف: أخبار، مراجعات، مواصفات، وتطبيقات تساعدك على القرار قبل الشراء.
            </p>
            <Link
              to="/page/$slug"
              params={{ slug: "about" }}
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-bg px-5 text-sm font-medium text-fg transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              تعرف علينا
              <span className="grid size-7 place-items-center rounded-full bg-fg/10">
                <ArrowLeft className="size-3.5" strokeWidth={1.75} />
              </span>
            </Link>
          </aside>
        </Reveal>
      ) : null}
    </main>
  );
}

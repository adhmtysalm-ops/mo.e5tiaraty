import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock3, Flame, Radio } from "lucide-react";
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
    <main id="main" className="mx-auto max-w-[1380px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <div className="editorial-intro">
        <div>
          <p className="section-kicker"><Radio className="size-3.5" /> غرفة الأخبار</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-fg sm:text-4xl">آخر الأخبار والتحليلات</h1>
        </div>
        <p className="hidden max-w-[30ch] text-sm leading-7 text-muted md:block">
          قراءة أسرع للخبر الأهم، ورأي أوضح قبل قرارك القادم.
        </p>
      </div>

      {page === 1 && data.featured ? (
        <section className="editorial-grid mt-6" aria-label="أبرز الأخبار">
          <Reveal className="editorial-lead lg:col-span-7">
            <FeaturedHero post={data.featured} editorial />
          </Reveal>

          <section className="editorial-column lg:col-span-3" aria-labelledby="editors-picks">
            <div className="editorial-heading">
              <h2 id="editors-picks">اختيارات المحررين</h2>
              <span className="editorial-heading-line" />
            </div>
            <div className="space-y-4">
              {data.mosaic.map((post, i) => (
                <Reveal key={post.id} delay={i * 80}>
                  <PostCard post={post} variant="row" />
                </Reveal>
              ))}
            </div>
          </section>

          <section className="editorial-column lg:col-span-2" aria-labelledby="latest-picks">
            <div className="editorial-heading">
              <h2 id="latest-picks">الأحدث</h2>
              <span className="editorial-heading-line" />
            </div>
            <div className="editorial-brief-list">
              {data.rest.slice(0, 5).map((post, i) => (
                <Reveal key={post.id} delay={i * 60}>
                  <PostCard post={post} variant="brief" />
                </Reveal>
              ))}
            </div>
          </section>
        </section>
      ) : (
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">الأحدث</h1>
        </header>
      )}

      {data.rest.length > 0 ? (
        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="section-kicker"><Flame className="size-3.5" /> تستحق القراءة</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">مختارات هذا الأسبوع</h2>
            </div>
            <span className="hidden items-center gap-2 text-xs text-subtle sm:flex"><Clock3 className="size-3.5" /> تحديث مستمر</span>
          </div>
          <div className="editorial-card-grid">
            {data.rest.slice(5).map((post, i) => (
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

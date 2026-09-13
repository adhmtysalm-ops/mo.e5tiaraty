import { createFileRoute, notFound } from "@tanstack/react-router";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { Reveal } from "@/components/reveal";
import { loadCategory } from "@/lib/wp/api";

export const Route = createFileRoute("/category/$slug")({
  validateSearch: (s: Record<string, unknown>): { page?: number } => {
    const n = Number(s.page);
    if (Number.isFinite(n) && n > 1) return { page: Math.floor(n) };
    return {};
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ deps, params }) => {
    const data = await loadCategory({ data: { slug: params.slug, page: deps.page } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.category.name} | اختياراتي موبايل`
          : "قسم",
      },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, posts } = Route.useLoaderData();
  const { slug } = Route.useParams();

  return (
    <main id="main" className="mx-auto max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-accent">قسم</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{category.name}</h1>
        <p className="mt-3 text-muted">
          {category.count ? `${category.count} مقال` : "مقالات هذا القسم"}
        </p>
      </header>

      {posts.items.length === 0 ? (
        <p className="mt-12 text-muted">لا توجد مقالات في هذا القسم بعد.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {posts.items.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 70}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      )}

      <Pagination
        page={posts.page}
        totalPages={posts.totalPages}
        to="/category/$slug"
        params={{ slug }}
        searchFor={(p) => ({ page: p })}
      />
    </main>
  );
}

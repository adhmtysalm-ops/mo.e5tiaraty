import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { loadSearch } from "@/lib/wp/api";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string; page?: number } => {
    const q = String(s.q ?? "").trim();
    const n = Number(s.page);
    return {
      ...(q ? { q } : {}),
      ...(Number.isFinite(n) && n > 1 ? { page: Math.floor(n) } : {}),
    };
  },
  loaderDeps: ({ search }) => ({ q: search.q ?? "", page: search.page ?? 1 }),
  loader: ({ deps }) => loadSearch({ data: deps }),
  head: () => ({
    meta: [{ title: "بحث | اختياراتي موبايل" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const results = Route.useLoaderData();
  const search = Route.useSearch();
  const q = search.q ?? "";
  const page = search.page ?? 1;
  const navigate = useNavigate({ from: "/search" });

  return (
    <main id="main" className="mx-auto max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">بحث</h1>
        <form
          className="mt-6 flex h-12 items-center rounded-full bg-surface px-4 shadow-[var(--shadow-border)]"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const next = String(fd.get("q") ?? "").trim();
            void navigate({ search: { q: next } });
          }}
        >
          <Search className="size-4 text-muted" strokeWidth={1.5} />
          <input
            name="q"
            defaultValue={q}
            placeholder="ابحث عن هاتف، مراجعة، أو موضوع"
            className="h-full w-full bg-transparent px-3 text-sm text-fg outline-none placeholder:text-subtle"
          />
        </form>
      </header>

      {q ? (
        <p className="mt-8 text-sm text-muted">
          {results.total} نتيجة عن «{q}»
        </p>
      ) : (
        <p className="mt-8 text-muted">اكتب كلمة للبحث في أرشيف اختياراتي موبايل.</p>
      )}

      {results.items.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {results.items.map((post) => (
            <PostCard key={post.id} post={post} variant="row" />
          ))}
        </div>
      ) : q ? (
        <p className="mt-10 text-muted">لا توجد نتائج مطابقة. جرّب صياغة أخرى.</p>
      ) : null}

      <Pagination
        page={page}
        totalPages={results.totalPages}
        to="/search"
        searchFor={(p) => ({ q, page: p })}
      />
    </main>
  );
}

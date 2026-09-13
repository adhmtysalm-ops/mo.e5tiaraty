import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatDate, readingLabel } from "@/lib/format";
import { loadPost } from "@/lib/wp/api";
import { PostCard } from "@/components/post-card";
import { ReadingProgress } from "@/components/reading-progress";
import { ShareBar } from "@/components/share-bar";
import { Reveal } from "@/components/reveal";
import { CoverImage } from "@/components/cover-image";

export const Route = createFileRoute("/post/$slug")({
  loader: async ({ params }) => {
    const data = await loadPost({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.post.title} | اختياراتي موبايل` : "مقال",
      },
      {
        name: "description",
        content: loaderData?.post.excerpt ?? "",
      },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { post, related } = Route.useLoaderData();
  const category = post.categories[0];

  return (
    <main id="main" className="pb-20">
      <ReadingProgress />
      <article className="mx-auto max-w-[1280px] px-4 pt-8 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-[720px]">
          {category ? (
            <Link
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="text-sm font-medium text-accent"
            >
              {category.name}
            </Link>
          ) : null}
          <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
            <span>{post.author.name}</span>
            <span className="text-subtle">·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="text-subtle">·</span>
            <span>{readingLabel(post.readingMinutes)}</span>
          </div>
        </header>

        {post.image ? (
          <div className="mx-auto mt-8 max-w-[960px] overflow-hidden rounded-xl bg-surface p-1.5 shadow-[var(--shadow-border)]">
            <div className="aspect-[16/9] overflow-hidden rounded-lg">
              <CoverImage src={post.image} alt={post.imageAlt} priority />
            </div>
          </div>
        ) : null}

        <div
          id="article-body"
          className="article-body mx-auto mt-10 max-w-[720px]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="mx-auto mt-12 max-w-[720px] border-t border-border pt-8">
          {post.categories.length > 0 ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.categories.map((c) => (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-[var(--shadow-border)] hover:text-fg"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          ) : null}
          <ShareBar title={post.title} />
        </footer>
      </article>

      {related.length > 0 ? (
        <section className="mx-auto mt-16 max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">مقالات ذات صلة</h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((item, i) => (
              <Reveal key={item.id} delay={i * 70}>
                <PostCard post={item} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

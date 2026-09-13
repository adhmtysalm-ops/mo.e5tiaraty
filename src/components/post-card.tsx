import { Link } from "@tanstack/react-router";
import { formatDate, readingLabel } from "@/lib/format";
import type { PostSummary } from "@/lib/wp/types";
import { cn } from "@/lib/utils";
import { CoverImage } from "@/components/cover-image";

export function PostCard({
  post,
  variant = "grid",
}: {
  post: PostSummary;
  variant?: "grid" | "row" | "mosaic" | "brief";
}) {
  const category = post.categories[0];

  if (variant === "row") {
    return (
      <Link
        to="/post/$slug"
        params={{ slug: post.slug }}
        className="group grid grid-cols-[6.5rem_1fr] gap-3 rounded-lg p-1.5 transition-[background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-surface sm:grid-cols-[9.5rem_1fr]"
      >
        <div className="aspect-[16/10] overflow-hidden rounded-lg bg-elevated">
          <CoverImage
            src={post.image}
            alt={post.imageAlt}
            className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center py-1">
          {category ? (
            <span className="mb-1 text-xs font-medium text-accent">{category.name}</span>
          ) : null}
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-fg sm:text-lg">
            {post.title}
          </h3>
          <p className="mt-2 text-xs text-muted">
            {formatDate(post.date)} · {readingLabel(post.readingMinutes)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "brief") {
    return (
      <Link
        to="/post/$slug"
        params={{ slug: post.slug }}
        className="group block border-b border-border py-3 first:pt-0 last:border-0"
      >
        {category ? <span className="text-[0.7rem] font-medium text-accent">{category.name}</span> : null}
        <h3 className="mt-1 line-clamp-3 text-sm font-semibold leading-6 tracking-tight text-fg transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mt-2 text-[0.7rem] text-subtle">{formatDate(post.date)}</p>
      </Link>
    );
  }

  const tall = variant === "mosaic";

  return (
    <Link
      to="/post/$slug"
      params={{ slug: post.slug }}
      className="group block"
    >
      <article className="rounded-xl bg-surface p-1.5 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[var(--shadow-border-hover)]">
        <div
          className={cn(
            "overflow-hidden rounded-lg bg-elevated",
            tall ? "aspect-[16/10]" : "aspect-[16/9]",
          )}
        >
          <CoverImage
            src={post.image}
            alt={post.imageAlt}
            className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        </div>
        <div className="px-3 pb-4 pt-3 sm:px-4">
          {category ? (
            <span className="text-xs font-medium text-accent">{category.name}</span>
          ) : null}
          <h3
            className={cn(
              "mt-1 font-semibold leading-snug tracking-tight text-fg",
              tall ? "text-xl sm:text-2xl" : "text-lg",
            )}
          >
            {post.title}
          </h3>
          {tall ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
          ) : null}
          <p className="mt-3 text-xs text-subtle">
            {formatDate(post.date)} · {readingLabel(post.readingMinutes)}
          </p>
        </div>
      </article>
    </Link>
  );
}

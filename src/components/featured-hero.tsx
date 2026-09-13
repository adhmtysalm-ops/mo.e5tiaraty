import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { formatDate, readingLabel } from "@/lib/format";
import type { PostSummary } from "@/lib/wp/types";
import { CoverImage } from "@/components/cover-image";

export function FeaturedHero({ post, editorial = false }: { post: PostSummary; editorial?: boolean }) {
  const category = post.categories[0];

  return (
    <Link to="/post/$slug" params={{ slug: post.slug }} className="group block">
      <article className={editorial ? "grid overflow-hidden bg-surface shadow-[var(--shadow-border)]" : "grid overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)] lg:grid-cols-12"}>
        <div className="relative aspect-[16/11] overflow-hidden bg-elevated lg:aspect-auto lg:min-h-[31rem]">
          <CoverImage
            src={post.image}
            alt={post.imageAlt}
            priority
            className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-col justify-end gap-5 p-6 sm:p-8 lg:p-9">
          {category ? (
            <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
              {category.name}
            </span>
          ) : null}
          <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight text-fg sm:text-4xl lg:text-[2.6rem]">
            {post.title}
          </h1>
          <p className="line-clamp-3 max-w-[38ch] text-base leading-relaxed text-muted">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-subtle">
              {formatDate(post.date)} · {readingLabel(post.readingMinutes)}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition-transform duration-150 ease-out group-hover:-translate-x-0.5 group-active:scale-[0.96]">
              اقرأ المقال
              <span className="grid size-6 place-items-center rounded-full bg-bg/15">
                <ArrowLeft className="size-3.5" strokeWidth={1.75} />
              </span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

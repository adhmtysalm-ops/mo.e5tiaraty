import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  to,
  params,
  searchFor,
}: {
  page: number;
  totalPages: number;
  to: string;
  params?: Record<string, string>;
  searchFor: (page: number) => Record<string, unknown>;
}) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav className="mt-12 flex items-center justify-center gap-3" aria-label="ترقيم الصفحات">
      <PageBtn
        disabled={!prev}
        to={to}
        params={params}
        search={prev ? searchFor(prev) : undefined}
        label="السابق"
      >
        <ChevronRight className="size-4" strokeWidth={1.75} />
        السابق
      </PageBtn>
      <span className="min-w-16 text-center text-sm tabular-nums text-muted">
        {page} / {totalPages}
      </span>
      <PageBtn
        disabled={!next}
        to={to}
        params={params}
        search={next ? searchFor(next) : undefined}
        label="التالي"
      >
        التالي
        <ChevronLeft className="size-4" strokeWidth={1.75} />
      </PageBtn>
    </nav>
  );
}

function PageBtn({
  to,
  params,
  search,
  disabled,
  children,
  label,
}: {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  const className = cn(
    "inline-flex h-11 min-w-24 items-center justify-center gap-1 rounded-full px-4 text-sm font-medium transition-[background-color,transform] duration-150 ease-out",
    disabled
      ? "cursor-not-allowed bg-surface text-subtle"
      : "bg-fg text-bg hover:opacity-90 active:scale-[0.96]",
  );
  if (disabled || !search) {
    return (
      <span className={className} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link
      to={to as "/"}
      params={params as { slug: string }}
      search={search as never}
      className={className}
      aria-label={label}
    >
      {children}
    </Link>
  );
}

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteChrome } from "@/lib/wp/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function SiteHeader({ chrome }: { chrome: SiteChrome }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    void navigate({ to: "/search", search: { q } });
    setSearchOpen(false);
  }

  const cats = chrome.categories.slice(0, 6);

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:end-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
      >
        التجاوز إلى المحتوى
      </a>
      <div className="glass-nav relative z-50 mx-auto flex h-16 max-w-[1280px] items-center gap-3 rounded-2xl bg-elevated/80 px-3 shadow-[var(--shadow-border)] backdrop-blur-xl sm:px-4">
        <Link to="/" className="flex shrink-0 items-center" aria-label={chrome.name}>
          <span className="logo-chip rounded-md bg-white px-1.5 py-1">
            <img src={chrome.logoUrl || "/logo.webp"} alt="" className="h-8 w-auto sm:h-9" />
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          <HeaderLink to="/" current={pathname === "/"}>
            الرئيسية
          </HeaderLink>
          {cats.map((c) => (
            <HeaderLink
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              current={pathname === `/category/${c.slug}`}
            >
              {c.name}
            </HeaderLink>
          ))}
          <HeaderLink to="/page/$slug" params={{ slug: "about" }} current={pathname === "/page/about"}>
            من نحن
          </HeaderLink>
        </nav>

        <div className="ms-auto flex items-center gap-0.5">
          <form
            onSubmit={onSearch}
            className={cn(
              "hidden items-center overflow-hidden rounded-full bg-bg transition-[width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex",
              searchOpen ? "w-56 opacity-100" : "w-11 opacity-100",
            )}
          >
            <button
              type={searchOpen ? "submit" : "button"}
              onClick={() => {
                if (!searchOpen) setSearchOpen(true);
              }}
              className="grid size-11 shrink-0 place-items-center text-fg"
              aria-label="بحث"
            >
              <Search className="size-4" strokeWidth={1.5} />
            </button>
            {searchOpen ? (
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث في المقالات"
                className="h-11 w-full bg-transparent pe-3 text-sm text-fg outline-none placeholder:text-subtle"
              />
            ) : null}
          </form>

          <a
            href="https://t.me/e5tiaraty"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden size-11 place-items-center rounded-full text-fg transition-colors duration-150 hover:bg-accent-soft sm:grid"
            aria-label="تيليجرام"
          >
            <Send className="size-4" strokeWidth={1.5} />
          </a>
          <ThemeToggle />
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-fg transition-colors duration-150 hover:bg-accent-soft lg:hidden"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative size-5">
              <Menu
                className={cn(
                  "absolute inset-0 size-5 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  open ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0",
                )}
                strokeWidth={1.5}
              />
              <X
                className={cn(
                  "absolute inset-0 size-5 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  open ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]",
                )}
                strokeWidth={1.5}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-bg/90 px-6 pt-24 backdrop-blur-xl lg:hidden">
          <form onSubmit={onSearch} className="mb-8 flex h-12 items-center rounded-full bg-surface px-4 shadow-[var(--shadow-border)]">
            <Search className="size-4 text-muted" strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في المقالات"
              className="h-full w-full bg-transparent px-3 text-base text-fg outline-none placeholder:text-subtle"
            />
          </form>
          <nav className="flex flex-col gap-2">
            {[
              { href: "/", label: "الرئيسية" },
              ...cats.map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
              { href: "/page/about", label: "من نحن" },
              { href: "/page/contact", label: "تواصل معنا" },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href as "/"}
                className="py-3 text-3xl font-semibold tracking-tight text-fg"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function HeaderLink({
  to,
  params,
  current,
  children,
}: {
  to: "/" | "/category/$slug" | "/page/$slug";
  params?: { slug: string };
  current?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      params={params}
      className={cn(
        "rounded-full px-3 py-2 text-sm font-medium transition-colors duration-150",
        current ? "bg-fg text-bg" : "text-muted hover:bg-accent-soft hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}

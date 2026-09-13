import { Link } from "@tanstack/react-router";
import type { SiteChrome } from "@/lib/wp/types";

export function SiteFooter({ chrome }: { chrome: SiteChrome }) {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <span className="logo-chip inline-flex rounded-md bg-white px-2 py-1">
            <img src={chrome.logoUrl || "/logo.webp"} alt="" className="h-8 w-auto" />
          </span>
          <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-muted">
            {chrome.description ||
              "منصة عربية متخصصة في عالم الهواتف. نختار لك الأفضل بمصداقية ووضوح."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
          <FooterCol title="الموقع">
            <Link to="/" className="hover:text-fg">
              الرئيسية
            </Link>
            <Link to="/page/$slug" params={{ slug: "about" }} className="hover:text-fg">
              من نحن
            </Link>
            <Link to="/page/$slug" params={{ slug: "contact" }} className="hover:text-fg">
              تواصل معنا
            </Link>
            <Link to="/search" className="hover:text-fg">
              بحث
            </Link>
          </FooterCol>
          <FooterCol title="أقسام">
            {chrome.categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="hover:text-fg"
              >
                {c.name}
              </Link>
            ))}
          </FooterCol>
          <FooterCol title="روابط">
            {chrome.footerLinks.map((l) => (
              <Link key={l.id} to={l.href as "/"} className="hover:text-fg">
                {l.label}
              </Link>
            ))}
            <a
              href="https://t.me/e5tiaraty"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fg"
            >
              تيليجرام
            </a>
            <a
              href="https://www.e5tiaraty.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fg"
            >
              اختياراتي للتقنية
            </a>
          </FooterCol>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} اختياراتي موبايل. جميع الحقوق محفوظة.</p>
          <p>محتوى مباشر من منصة ووردبريس.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-fg">{title}</p>
      <div className="flex flex-col gap-2 text-sm text-muted">{children}</div>
    </div>
  );
}

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { loadChrome } from "@/lib/wp/api";
import appCss from "../styles.css?url";

const APP_NAME = "اختياراتي موبايل";

const THEME_BOOT = `(function(){try{var t=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(t!=="light"&&d))document.documentElement.classList.add("dark");}catch(e){}})();`;

export const Route = createRootRoute({
  loader: () => loadChrome(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "اختياراتي موبايل: أخبار ومراجعات ومواصفات الهواتف الذكية بالعربية.",
      },
      { name: "theme-color", content: "#d01212" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const chrome = Route.useLoaderData();

  return (
    <html lang="ar" dir="rtl" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-[100dvh] bg-bg font-sans text-fg">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <PreviewHostBridge />
        <div className="noise-overlay" aria-hidden="true" />
        <AuthProvider>
          <div className="flex min-h-[100dvh] flex-col">
            <SiteHeader chrome={chrome} />
            <div className="flex-1">
              <Outlet />
            </div>
            <SiteFooter chrome={chrome} />
          </div>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

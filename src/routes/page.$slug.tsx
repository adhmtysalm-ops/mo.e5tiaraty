import { createFileRoute, notFound } from "@tanstack/react-router";
import { ContactForm } from "@/components/contact-form";
import { loadPage } from "@/lib/wp/api";

export const Route = createFileRoute("/page/$slug")({
  loader: async ({ params }) => {
    const page = await loadPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.title} | اختياراتي موبايل` : "صفحة",
      },
      { name: "description", content: loaderData?.excerpt ?? "" },
    ],
  }),
  component: CmsPage,
});

function CmsPage() {
  const page = Route.useLoaderData();
  const isContact = page.slug === "contact";
  const isAbout = page.slug === "about" || page.slug === "about-us";

  return (
    <main id="main" className="mx-auto max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <header className="max-w-[720px]">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {isAbout ? "من نحن" : isContact ? "تواصل معنا" : page.title}
        </h1>
        {isAbout ? (
          <p className="mt-4 max-w-[50ch] text-lg leading-relaxed text-muted">
            منصة عربية متخصصة في عالم الهواتف، نساعدك على الفهم والاختيار قبل الشراء.
          </p>
        ) : null}
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className={isContact ? "lg:col-span-7" : "lg:col-span-8"}>
          <div
            className="article-body max-w-[720px]"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
        {isContact ? (
          <div className="lg:col-span-5">
            <ContactForm />
          </div>
        ) : null}
      </div>
    </main>
  );
}

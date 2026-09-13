import { createServerFn } from "@tanstack/react-start";
import type {
  ContactResult,
  HomeData,
  PagedPosts,
  PostDetail,
  PostSummary,
  SiteChrome,
  Term,
  WpPage,
} from "@/lib/wp/types";

export const loadChrome = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteChrome> => {
    const { fetchChrome } = await import("./client.server");
    return fetchChrome();
  },
);

export const loadHome = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    const o = (d ?? {}) as Record<string, unknown>;
    return { page: Math.max(1, Number(o.page ?? 1) || 1) };
  })
  .handler(async ({ data }): Promise<HomeData> => {
    const { fetchHome } = await import("./client.server");
    return fetchHome(data.page);
  });

export const loadPost = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    const o = (d ?? {}) as Record<string, unknown>;
    return { slug: String(o.slug ?? "") };
  })
  .handler(
    async ({
      data,
    }): Promise<{ post: PostDetail; related: PostSummary[] } | null> => {
      const { fetchPostBySlug, fetchRelated } = await import("./client.server");
      const post = await fetchPostBySlug(data.slug);
      if (!post) return null;
      const related = await fetchRelated(post);
      return { post, related };
    },
  );

export const loadCategory = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    const o = (d ?? {}) as Record<string, unknown>;
    return {
      slug: String(o.slug ?? ""),
      page: Math.max(1, Number(o.page ?? 1) || 1),
    };
  })
  .handler(
    async ({
      data,
    }): Promise<{ category: Term; posts: PagedPosts } | null> => {
      const { fetchCategoryBySlug, fetchPosts } = await import("./client.server");
      const category = await fetchCategoryBySlug(data.slug);
      if (!category) return null;
      const posts = await fetchPosts({
        page: data.page,
        perPage: 9,
        category: category.id,
      });
      return { category, posts };
    },
  );

export const loadPage = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    const o = (d ?? {}) as Record<string, unknown>;
    return { slug: String(o.slug ?? "") };
  })
  .handler(async ({ data }): Promise<WpPage | null> => {
    const { fetchPageBySlug } = await import("./client.server");
    return fetchPageBySlug(data.slug);
  });

export const loadSearch = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    const o = (d ?? {}) as Record<string, unknown>;
    return {
      q: String(o.q ?? "").trim(),
      page: Math.max(1, Number(o.page ?? 1) || 1),
    };
  })
  .handler(async ({ data }): Promise<PagedPosts> => {
    if (!data.q) {
      return { items: [], total: 0, totalPages: 0, page: 1 };
    }
    const { fetchPosts } = await import("./client.server");
    return fetchPosts({ page: data.page, perPage: 10, search: data.q });
  });

export const submitContact = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const o = (d ?? {}) as Record<string, unknown>;
    const name = String(o.name ?? "").trim();
    const email = String(o.email ?? "").trim();
    const message = String(o.message ?? "").trim();
    if (name.length < 2) throw new Error("الاسم قصير جدا.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("البريد الإلكتروني غير صالح.");
    }
    if (message.length < 8) throw new Error("الرسالة قصيرة جدا.");
    return { name, email, message };
  })
  .handler(async ({ data }): Promise<ContactResult> => {
    const { postContactMessage } = await import("./client.server");
    return postContactMessage(data);
  });

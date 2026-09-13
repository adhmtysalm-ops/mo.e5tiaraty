import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeHtml, estimateReadingMinutes, stripTags } from "@/lib/format";
import { sanitizeWpHtml } from "@/lib/wp/sanitize.server";
import { LOCAL_LOGO, WP_API, WP_ORIGIN, wpAuthHeader } from "@/lib/wp/config.server";
import type {
  Author,
  ContactResult,
  HomeData,
  NavLink,
  PagedPosts,
  PostDetail,
  PostSummary,
  SiteChrome,
  Term,
  WpPage,
} from "@/lib/wp/types";

type CacheEntry = { at: number; value: unknown };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 40_000;
const LIVE_TIMEOUT_MS = 4_000;

type Snapshot = {
  chrome: SiteChrome;
  posts: PostDetail[];
  pages: Record<string, WpPage>;
};

const snapshot: Snapshot = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "snapshot.json"), "utf8"),
) as Snapshot;

type WpFetchResult<T> = {
  data: T;
  total: number;
  totalPages: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

async function wpFetch<T>(
  path: string,
  init?: RequestInit & { auth?: boolean },
): Promise<WpFetchResult<T>> {
  const url = path.startsWith("http") ? path : `${WP_API}${path}`;
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  headers.set("User-Agent", "E5tiaratyMagazine/1.0");
  if (init?.auth) {
    const auth = wpAuthHeader();
    if (auth && !headers.has("Authorization")) headers.set("Authorization", auth);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    signal: init?.signal ?? AbortSignal.timeout(LIVE_TIMEOUT_MS),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WordPress ${res.status} ${res.statusText} ${body.slice(0, 180)}`);
  }

  const data = (await res.json()) as T;
  return {
    data,
    total: Number(res.headers.get("X-WP-Total") ?? res.headers.get("x-wp-total") ?? 0),
    totalPages: Number(
      res.headers.get("X-WP-TotalPages") ?? res.headers.get("x-wp-totalpages") ?? 0,
    ),
  };
}

async function cached<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value as T;
  const value = await fn();
  cache.set(key, { at: Date.now(), value });
  return value;
}

function rendered(value: unknown): string {
  if (typeof value === "string") return decodeHtml(value);
  const rec = asRecord(value);
  if (typeof rec.rendered === "string") return decodeHtml(rec.rendered);
  return "";
}

function pickImage(embedded: unknown): { url: string | null; alt: string } {
  const rec = asRecord(embedded);
  const media = rec["wp:featuredmedia"];
  const first = Array.isArray(media) ? asRecord(media[0]) : {};
  if (!first.source_url && !first.media_details) return { url: null, alt: "" };
  const details = asRecord(first.media_details);
  const sizes = asRecord(details.sizes);
  const large = asRecord(sizes.large);
  const mediumLarge = asRecord(sizes.medium_large);
  const medium = asRecord(sizes.medium);
  const url =
    (typeof large.source_url === "string" && large.source_url) ||
    (typeof mediumLarge.source_url === "string" && mediumLarge.source_url) ||
    (typeof medium.source_url === "string" && medium.source_url) ||
    (typeof first.source_url === "string" && first.source_url) ||
    null;
  return { url, alt: typeof first.alt_text === "string" ? first.alt_text : "" };
}

function pickTerms(embedded: unknown, taxonomy: string): Term[] {
  const rec = asRecord(embedded);
  const groups = rec["wp:term"];
  if (!Array.isArray(groups)) return [];
  const out: Term[] = [];
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const raw of group) {
      const t = asRecord(raw);
      if (t.taxonomy !== taxonomy) continue;
      out.push({
        id: Number(t.id),
        slug: String(t.slug ?? ""),
        name: decodeHtml(String(t.name ?? "")),
        count: typeof t.count === "number" ? t.count : undefined,
      });
    }
  }
  return out;
}

function pickAuthor(embedded: unknown): Author {
  const rec = asRecord(embedded);
  const authors = rec.author;
  const first = Array.isArray(authors) ? asRecord(authors[0]) : {};
  const avatarUrls = asRecord(first.avatar_urls);
  const avatar =
    (typeof avatarUrls["96"] === "string" && avatarUrls["96"]) ||
    (typeof avatarUrls["48"] === "string" && avatarUrls["48"]) ||
    null;
  return {
    name: String(first.name ?? "اختياراتي"),
    slug: String(first.slug ?? ""),
    avatar,
  };
}

function mapPost(raw: unknown): PostSummary {
  const p = asRecord(raw);
  const embedded = p._embedded;
  const image = pickImage(embedded);
  const contentHtml = rendered(p.content);
  const excerptSource = rendered(p.excerpt) || contentHtml;
  return {
    id: Number(p.id),
    slug: String(p.slug ?? ""),
    title: rendered(p.title) || "بدون عنوان",
    excerpt: stripTags(excerptSource).slice(0, 220),
    date: String(p.date ?? ""),
    image: image.url,
    imageAlt: image.alt || rendered(p.title),
    categories: pickTerms(embedded, "category").filter((c) => c.slug !== "uncategorized"),
    author: pickAuthor(embedded),
    readingMinutes: contentHtml
      ? estimateReadingMinutes(contentHtml)
      : Math.max(3, estimateReadingMinutes(excerptSource) * 5),
  };
}

function mapPostDetail(raw: unknown): PostDetail {
  const p = asRecord(raw);
  const summary = mapPost(raw);
  const status = p.comment_status === "open" ? "open" : "closed";
  return {
    ...summary,
    content: sanitizeWpHtml(rendered(p.content)),
    tags: pickTerms(p._embedded, "post_tag"),
    commentStatus: status,
  };
}

function asSummary(post: PostDetail): PostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    image: post.image,
    imageAlt: post.imageAlt,
    categories: post.categories,
    author: post.author,
    readingMinutes: post.readingMinutes,
  };
}

function filterSnapshot(input: {
  category?: number;
  search?: string;
  exclude?: number;
}): PostDetail[] {
  let items = snapshot.posts;
  if (input.category) {
    items = items.filter((p) => p.categories.some((c) => c.id === input.category));
  }
  if (input.search?.trim()) {
    const q = input.search.trim().toLowerCase();
    items = items.filter(
      (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q),
    );
  }
  if (input.exclude) items = items.filter((p) => p.id !== input.exclude);
  return items;
}

function pageSnapshot(items: PostSummary[], page: number, perPage: number): PagedPosts {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage) || 1);
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total,
    totalPages,
    page,
  };
}

function snapshotPost(slug: string): PostDetail | null {
  const found = snapshot.posts.find((p) => p.slug === slug);
  if (!found) return null;
  return { ...found, content: sanitizeWpHtml(found.content) };
}

function toAppHref(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#") return null;
  try {
    const resolved = new URL(trimmed, WP_ORIGIN);
    const path = resolved.pathname.replace(/\/+$/, "") || "/";
    if (path === "/") return "/";
    if (path === "/about" || path === "/about-us") return "/page/about";
    if (path === "/contact") return "/page/contact";
    if (path.startsWith("/category/")) {
      return `/category/${path.slice("/category/".length)}`;
    }
    const slug = path.replace(/^\//, "");
    if (!slug) return "/";
    if (["privacy-policy", "privacy", "terms", "terms-conditions"].includes(slug)) {
      return `/page/${slug}`;
    }
    return `/page/${slug}`;
  } catch {
    return null;
  }
}

export async function fetchChrome(): Promise<SiteChrome> {
  return cached("chrome", TTL_MS, async () => {
    try {
      const catRes = await wpFetch<unknown[]>(
        "/wp/v2/categories?per_page=100&hide_empty=true",
        { signal: AbortSignal.timeout(2_000) },
      );
      const categories = catRes.data
        .map((raw) => {
          const c = asRecord(raw);
          return {
            id: Number(c.id),
            slug: String(c.slug ?? ""),
            name: decodeHtml(String(c.name ?? "")),
            count: Number(c.count ?? 0),
          };
        })
        .filter((c) => c.slug !== "uncategorized" && (c.count ?? 0) > 0);
      if (categories.length === 0) return snapshot.chrome;
      return { ...snapshot.chrome, categories };
    } catch {
      return snapshot.chrome;
    }
  });
}

export async function fetchPosts(input: {
  page?: number;
  perPage?: number;
  category?: number;
  search?: string;
  exclude?: number;
}): Promise<PagedPosts> {
  const page = Math.max(1, input.page ?? 1);
  const perPage = Math.min(20, Math.max(1, input.perPage ?? 10));
  const params = new URLSearchParams({
    _embed: "1",
    page: String(page),
    per_page: String(perPage),
    status: "publish",
    _fields: "id,date,slug,title,excerpt,featured_media,categories,_links,_embedded",
  });
  if (input.category) params.set("categories", String(input.category));
  if (input.search?.trim()) params.set("search", input.search.trim());
  if (input.exclude) params.set("exclude", String(input.exclude));

  const key = `posts:${params.toString()}`;
  return cached(key, TTL_MS, async () => {
    try {
      const res = await wpFetch<unknown[]>(`/wp/v2/posts?${params.toString()}`);
      if (res.data.length > 0) {
        return {
          items: res.data.map(mapPost),
          total: res.total,
          totalPages: Math.max(1, res.totalPages || 1),
          page,
        };
      }
    } catch {
      /* use snapshot */
    }
    return pageSnapshot(
      filterSnapshot(input).map(asSummary),
      page,
      perPage,
    );
  });
}

export async function fetchHome(page = 1): Promise<HomeData> {
  const paged = await fetchPosts({ page, perPage: page === 1 ? 12 : 9 });
  if (page > 1) {
    return {
      featured: null,
      mosaic: [],
      rest: paged.items,
      total: paged.total,
      totalPages: paged.totalPages,
      page,
    };
  }
  const [featured, ...others] = paged.items;
  return {
    featured: featured ?? null,
    mosaic: others.slice(0, 2),
    rest: others.slice(2),
    total: paged.total,
    totalPages: paged.totalPages,
    page,
  };
}

export async function fetchPostBySlug(slug: string): Promise<PostDetail | null> {
  const key = `post:${slug}`;
  return cached(key, TTL_MS, async () => {
    try {
      const res = await wpFetch<unknown[]>(
        `/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`,
      );
      const first = res.data[0];
      if (first) return mapPostDetail(first);
    } catch {
      /* use snapshot */
    }
    return snapshotPost(slug);
  });
}

export async function fetchRelated(post: PostDetail): Promise<PostSummary[]> {
  const categoryId = post.categories[0]?.id;
  const paged = await fetchPosts({
    perPage: 3,
    category: categoryId,
    exclude: post.id,
  });
  return paged.items.slice(0, 3);
}

export async function fetchCategoryBySlug(slug: string): Promise<Term | null> {
  const chrome = await fetchChrome();
  const fromChrome = chrome.categories.find((c) => c.slug === slug);
  if (fromChrome) return fromChrome;
  const fromSnap = snapshot.chrome.categories.find((c) => c.slug === slug);
  if (fromSnap) return fromSnap;
  try {
    const res = await wpFetch<unknown[]>(`/wp/v2/categories?slug=${encodeURIComponent(slug)}`);
    const first = res.data[0];
    if (!first) return null;
    const c = asRecord(first);
    return {
      id: Number(c.id),
      slug: String(c.slug ?? slug),
      name: decodeHtml(String(c.name ?? slug)),
      count: Number(c.count ?? 0),
    };
  } catch {
    return null;
  }
}

export async function fetchPageBySlug(slug: string): Promise<WpPage | null> {
  const aliases: Record<string, string[]> = {
    about: ["about", "about-us"],
    contact: ["contact"],
    "privacy-policy": ["privacy-policy", "privacy"],
  };
  const slugs = aliases[slug] ?? [slug];
  return cached(`page:${slugs.join(",")}`, TTL_MS, async () => {
    try {
      for (const s of slugs) {
        const res = await wpFetch<unknown[]>(`/wp/v2/pages?slug=${encodeURIComponent(s)}`);
        const first = res.data[0];
        if (!first) continue;
        const p = asRecord(first);
        const content = sanitizeWpHtml(rendered(p.content));
        if (content.includes("stk-block") || content.includes("wpforms")) {
          break;
        }
        return {
          id: Number(p.id),
          slug: String(p.slug ?? s),
          title: rendered(p.title),
          content,
          excerpt: stripTags(rendered(p.excerpt) || content).slice(0, 200),
        };
      }
    } catch {
      /* use snapshot */
    }
    for (const s of slugs) {
      if (snapshot.pages[s]) return snapshot.pages[s];
    }
    if (snapshot.pages[slug]) return snapshot.pages[slug];
    return null;
  });
}

export async function postContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactResult> {
  const page = await fetchPageBySlug("contact");
  if (!page) {
    return { ok: false, message: "تعذر الوصول لصفحة التواصل حاليا." };
  }
  try {
    await wpFetch("/wp/v2/comments", {
      method: "POST",
      auth: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post: page.id,
        author_name: input.name,
        author_email: input.email,
        content: input.message,
      }),
    });
    return { ok: true, message: "وصلت رسالتك. سنعود إليك في أقرب وقت." };
  } catch {
    return {
      ok: false,
      message: "تعذر إرسال الرسالة الآن. راسلنا لاحقا أو أعد المحاولة.",
    };
  }
}

export type Term = {
  id: number;
  slug: string;
  name: string;
  count?: number;
};

export type Author = {
  name: string;
  slug: string;
  avatar: string | null;
};

export type PostSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
  imageAlt: string;
  categories: Term[];
  author: Author;
  readingMinutes: number;
};

export type PostDetail = PostSummary & {
  content: string;
  tags: Term[];
  commentStatus: "open" | "closed";
};

export type WpPage = {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
};

export type NavLink = {
  id: number;
  label: string;
  href: string;
};

export type SiteChrome = {
  name: string;
  description: string;
  logoUrl: string;
  categories: Term[];
  footerLinks: NavLink[];
};

export type PagedPosts = {
  items: PostSummary[];
  total: number;
  totalPages: number;
  page: number;
};

export type HomeData = {
  featured: PostSummary | null;
  mosaic: PostSummary[];
  rest: PostSummary[];
  total: number;
  totalPages: number;
  page: number;
};

export type ContactResult = {
  ok: boolean;
  message: string;
};

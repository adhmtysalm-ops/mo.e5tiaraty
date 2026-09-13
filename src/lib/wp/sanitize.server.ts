import sanitizeHtml from "sanitize-html";

const ALLOWED_IFRAME =
  /^(https?:)?\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com|tiktok\.com)\//;

export function sanitizeWpHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "figure",
      "figcaption",
      "picture",
      "source",
      "iframe",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "colgroup",
      "col",
      "video",
      "audio",
      "cite",
      "blockquote",
      "hr",
      "span",
      "div",
      "section",
      "br",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "srcset", "sizes", "alt", "title", "width", "height", "loading", "decoding"],
      iframe: ["src", "allow", "allowfullscreen", "frameborder", "title", "width", "height"],
      source: ["src", "srcset", "type", "sizes"],
      video: ["src", "controls", "poster", "width", "height"],
      audio: ["src", "controls"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      "*": ["class", "id"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedIframeHostnames: [
      "www.youtube.com",
      "youtube.com",
      "www.youtube-nocookie.com",
      "youtube-nocookie.com",
      "player.vimeo.com",
      "www.tiktok.com",
      "tiktok.com",
    ],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const extra: Record<string, string> = { ...attribs };
        if (/^https?:/i.test(href)) {
          extra.target = "_blank";
          extra.rel = "noopener noreferrer";
        }
        return { tagName, attribs: extra };
      },
      iframe: (tagName, attribs) => {
        const src = attribs.src ?? "";
        if (!ALLOWED_IFRAME.test(src)) {
          return { tagName: "span", attribs: {} };
        }
        return { tagName, attribs };
      },
    },
    exclusiveFilter: (frame) =>
      frame.tag === "style" || frame.tag === "script" || frame.tag === "noscript",
  });
}

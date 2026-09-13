export function decodeHtml(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/'/g, "'")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n);
      if (code === 8211 || code === 8212) return "-";
      return String.fromCharCode(code);
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
      const code = parseInt(n, 16);
      if (code === 0x2013 || code === 0x2014) return "-";
      return String.fromCharCode(code);
    });
}

export function stripTags(html: string): string {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function readingLabel(minutes: number): string {
  const n = Math.max(1, minutes);
  if (n === 1) return "دقيقة قراءة";
  if (n === 2) return "دقيقتان قراءة";
  if (n >= 3 && n <= 10) return `${n} دقائق قراءة`;
  return `${n} دقيقة قراءة`;
}

export function estimateReadingMinutes(html: string): number {
  const text = stripTags(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

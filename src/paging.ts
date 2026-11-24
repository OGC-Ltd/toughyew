// Page numbers for the staff lists: which slice of the list to show, and the links for the pager
// (views/partials/mixins.pug, +pager). Long runs of pages collapse to the first, the last and those near
// the current one, with a gap between.
export type Paging = {
  page: number; pages: number; from: number; to: number; size: number;
  prev: string; next: string;
  links: ({ n: number; href: string; current: boolean } | { gap: true })[];
};

export function pageOf(count: number, requested: unknown, size: number, base: string, keep: Record<string, string> = {}): Paging {
  const pages = Math.max(1, Math.ceil(count / size));
  const page = Math.min(pages, Math.max(1, Math.floor(Number(requested)) || 1));
  const href = (n: number) => {
    const q = new URLSearchParams({ ...keep, ...(n > 1 && { page: String(n) }) }).toString();
    return q ? `${base}?${q}` : base;
  };
  const shown = [...new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))].sort((a, b) => a - b);
  const links: Paging['links'] = [];
  shown.forEach((n, i) => {
    if (i && n - shown[i - 1] > 1) links.push({ gap: true });
    links.push({ n, href: href(n), current: n === page });
  });
  return {
    page, pages, size, from: (page - 1) * size, to: Math.min(count, page * size),
    prev: page > 1 ? href(page - 1) : '', next: page < pages ? href(page + 1) : '', links,
  };
}

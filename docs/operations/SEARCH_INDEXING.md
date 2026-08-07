# Search indexing policy

This document defines which NexoChess URLs may appear in public search results and how that policy is enforced.

The source of truth is [`config/search-indexing.mjs`](../../config/search-indexing.mjs). `robots.txt`, `sitemap.xml`, Cloudflare response headers and CI verification must remain aligned with that module.

## Indexable pages

Only canonical production URLs on `https://www.nexochess.com` may be indexed.

| Path | Purpose |
| --- | --- |
| `/analysis` | Main chess analysis application |
| `/academy` | Public Academy landing page |
| `/puzzles` | Public puzzle-training landing page |
| `/help` | Public help centre |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/source` | Source-code, licence and attribution information |

The clean path is the only indexable form. Query-string variants are application states, not independent documents. For example, `/analysis?game=...` returns `noindex, follow` and points its canonical URL to `/analysis`.

## Pages excluded from search

| Path or prefix | Directive | Reason |
| --- | --- | --- |
| `/archive` | `noindex, follow` | Contains local or account-specific games |
| `/signin` | `noindex, follow` | Authentication utility page |
| `/signup` | `noindex, follow` | Authentication utility page |
| `/auth/reset-password` | `noindex, nofollow` | Can contain a single-use recovery token |
| `/settings` and descendants | `noindex, nofollow` | User-specific controls |
| `/profile` and descendants | `noindex, follow` | Dynamic profile URLs and duplicate states |
| `/internal` and descendants | `noindex, nofollow` | Internal administration |
| `/news` and descendants | `noindex, follow` | Retired routes that redirect to analysis |
| unknown HTML and error pages | `noindex, nofollow` | No standalone public search value |

`noindex` is an indexing instruction, not an access-control mechanism. Authentication, authorisation and API isolation must still protect private data.

## Environments

Production indexing requires both conditions:

1. `NEXOCHESS_ENV=production`;
2. the request host is exactly `www.nexochess.com`.

Staging, preview branches, the apex redirect host and internal Worker addresses receive:

```text
X-Robots-Tag: noindex, nofollow, noarchive
```

The staging `robots.txt` allows crawling so a crawler can read the `noindex` response header. It does not advertise the production sitemap. The staging `/sitemap.xml` returns `404`.

## robots.txt

Production `robots.txt` blocks only technical resources:

```text
/api/
/apps/
/cloudflare-build.json
```

HTML pages excluded with `noindex` are deliberately not blocked in `robots.txt`. A crawler must be able to request those pages to receive their robots metadata and `X-Robots-Tag` header.

## Sitemap

The production sitemap contains exactly the seven canonical indexable pages. It does not contain private pages, query-string variants, redirects or manually maintained `changefreq`, `priority` or `lastmod` values.

Both source files are regenerated during the Cloudflare build:

```text
client/public/robots.txt
client/public/sitemap.xml
```

## Enforcement

The Cloudflare Worker applies `X-Robots-Tag` after routing, using:

- request host;
- `NEXOCHESS_ENV`;
- response status;
- response content type;
- pathname and query string.

This provides a second enforcement layer in addition to HTML `<meta name="robots">` tags.

Run the dedicated verification locally:

```bash
npm run verify:indexing
```

It is also included in:

```bash
npm run check
```

The verifier fails when:

- sitemap and central policy differ;
- `robots.txt` blocks a page that needs to expose `noindex`;
- an indexable page lacks `index` metadata or its production canonical URL;
- a private or error document lacks `noindex`;
- staging becomes indexable;
- a parameterised analysis URL becomes indexable;
- the Worker or Cloudflare build stops consuming the central policy.

## Adding or changing a route

1. Classify the route in `config/search-indexing.mjs`.
2. Add it to `INDEXABLE_PAGE_ROUTES` or `NOINDEX_PAGE_RULES`.
3. Ensure its HTML metadata matches the classification.
4. For a public route, provide a self-referencing production canonical URL.
5. For a private route, keep it out of the sitemap and do not block it in `robots.txt` merely to hide it.
6. Run `npm run verify:indexing` and the full `npm run check`.
7. Validate response headers in staging before promoting the change to production.

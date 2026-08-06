import {
    INDEXABLE_PAGE_ROUTES,
    renderSitemapXml as renderIndexingSitemapXml
} from "./search-indexing.mjs";
import {
    PRODUCTION_CANONICAL_ORIGIN,
    productionUrl
} from "./site.mjs";

export const SITEMAP_PATHNAME = "/sitemap.xml";
export const SITEMAP_FILENAME = "sitemap.xml";
export const SITEMAP_MEDIA_TYPE = "application/xml; charset=utf-8";
export const SITEMAP_NAMESPACE =
    "http://www.sitemaps.org/schemas/sitemap/0.9";

export const SITEMAP_PROTOCOL_LIMITS = Object.freeze({
    maxUrls: 50_000,
    maxUncompressedBytes: 50 * 1024 * 1024
});

export const SITEMAP_ENTRIES = Object.freeze(
    INDEXABLE_PAGE_ROUTES.map(route => Object.freeze({
        pathname: route.pathname,
        url: productionUrl(route.pathname)
    }))
);

export const SITEMAP_POLICY = Object.freeze({
    origin: PRODUCTION_CANONICAL_ORIGIN,
    pathname: SITEMAP_PATHNAME,
    filename: SITEMAP_FILENAME,
    mediaType: SITEMAP_MEDIA_TYPE,
    namespace: SITEMAP_NAMESPACE,
    includeLastModified: false,
    includeChangeFrequency: false,
    includePriority: false
});

export function renderSitemapXml() {
    return renderIndexingSitemapXml();
}

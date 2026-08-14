export const SEARCH_FAVICON_SOURCE_PATH = "img/nexochess-icon.png";
export const SEARCH_FAVICON_FILENAME = "favicon.svg";
export const SEARCH_FAVICON_HREF = `/${SEARCH_FAVICON_FILENAME}`;
export const SEARCH_FAVICON_LINK =
    `<link rel="icon" type="image/svg+xml" href="${SEARCH_FAVICON_HREF}">`;

const FAVICON_LINK_PATTERN =
    /<link\b[^>]*\brel=["'](?:shortcut\s+)?icon["'][^>]*>/gi;

export function renderSearchFaviconSvg(iconBase64) {
    const encodedIcon = String(iconBase64 || "").trim();
    if (!encodedIcon) {
        throw new Error("The NexoChess search favicon source is empty.");
    }

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
        `    <image href="data:image/png;base64,${encodedIcon}" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>`,
        "</svg>",
        ""
    ].join("\n");
}

export function applySearchFaviconLink(html) {
    const links = String(html).match(FAVICON_LINK_PATTERN) || [];
    if (links.length > 1) {
        throw new Error("HTML documents must not declare more than one favicon link.");
    }
    if (links.length === 1) {
        return html.replace(FAVICON_LINK_PATTERN, SEARCH_FAVICON_LINK);
    }
    if (!html.includes("</head>")) {
        throw new Error("Cannot inject the NexoChess favicon without a closing head tag.");
    }
    return html.replace("</head>", `    ${SEARCH_FAVICON_LINK}\n</head>`);
}

export function applySearchFaviconManifest(manifest) {
    return {
        ...manifest,
        icons: [
            {
                src: SEARCH_FAVICON_HREF,
                sizes: "any",
                type: "image/svg+xml"
            }
        ]
    };
}

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const paths = {
    pageWrapper: "client/src/components/layout/PageWrapper/index.tsx",
    pageStyles: "client/src/components/layout/PageWrapper/PageWrapper.module.css",
    accessibilityStyles: "client/src/components/layout/PageWrapper/Accessibility.css",
    navigation: "client/src/components/layout/NavigationBar/index.tsx",
    sidebar: "client/src/components/layout/sidebar/Sidebar/index.tsx",
    sidebarTab: "client/src/components/layout/sidebar/SidebarTab/index.tsx",
    dropdown: "client/src/components/layout/NavigationBar/HoverDropdown/index.tsx",
    dialog: "client/src/components/common/Dialog/index.tsx",
    textField: "client/src/components/common/TextField/index.tsx",
    logMessage: "client/src/components/common/LogMessage/index.tsx",
    copy: "client/src/i18n/accessibilityCopy.ts"
};

const files = Object.fromEntries(await Promise.all(
    Object.entries(paths).map(async ([name, path]) => [
        name,
        await readFile(resolve(path), "utf8")
    ])
));

function requireFragments(name, description, fragments) {
    for (const fragment of fragments) {
        assert.ok(
            files[name].includes(fragment),
            `${description} is missing: ${fragment}`
        );
    }
}

requireFragments("pageWrapper", "Skip navigation", [
    'href="#nexo-main-content"',
    'id="nexo-main-content"',
    "tabIndex={-1}",
    "accessibilityCopy.skipToContent"
]);
requireFragments("pageStyles", "Visible skip link", [
    ".skipLink", ".skipLink:focus-visible"
]);
requireFragments("accessibilityStyles", "Global focus and contrast safeguards", [
    ":focus-visible", "outline: 3px solid", "--nexo-text-muted: rgba(35, 55, 79, 0.72)"
]);
requireFragments("navigation", "Sidebar trigger semantics", [
    'aria-controls="nexo-sidebar"', "aria-expanded={sidebarOpen}", "open={sidebarOpen}"
]);
requireFragments("sidebar", "Keyboard-safe sidebar", [
    'role="dialog"', "aria-modal={open}", "aria-hidden={!open}",
    'event.key === "Escape"', 'event.key !== "Tab"',
    'type="button"', 'aria-label={t("dialog.close")}',
    "tabIndex={tabIndex}"
]);
assert.ok(
    !files.sidebar.includes("<img\n                className={styles.closeButton}"),
    "Sidebar close control must not regress to a clickable image."
);
requireFragments("sidebarTab", "Semantic sidebar links", [
    "return <a", "href={url}", 'alt=""', "aria-current={isTabActive"
]);
requireFragments("dropdown", "Accessible dropdown menus", [
    "<button", 'aria-haspopup', '"aria-expanded"', 'role="menu"',
    'role="menuitem"', 'event.key === "Escape"'
]);
requireFragments("dialog", "Accessible modal dialogs", [
    'role="dialog"', 'aria-modal="true"', 'event.key === "Escape"',
    'event.key !== "Tab"', "previousFocus?.focus()", 'ariaLabel={t("dialog.close")}'
]);
requireFragments("textField", "Keyboard-accessible copy control", [
    'type="button"', "accessibilityCopy.copyToClipboard", 'alt=""'
]);
assert.ok(
    !files.textField.includes("{copyable && <div"),
    "TextField copy control must remain a native button."
);
requireFragments("logMessage", "Live status announcements", [
    'role={role}', 'theme === "error" ? "alert" : "status"', 'aria-hidden="true"'
]);

for (const language of ["en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"]) {
    assert.ok(
        files.copy.includes(`\n    ${language}: {`),
        `Accessibility copy is missing language ${language}.`
    );
}
requireFragments("copy", "Localized accessibility copy", [
    "skipToContent", "copyToClipboard", "getAccessibilityCopy"
]);

console.log("Accessibility verification passed: keyboard navigation, focus management, semantics, contrast safeguards and 11-language assistive copy are wired.");

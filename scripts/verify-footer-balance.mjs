import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const footer = await readFile(
    resolve("client/src/components/layout/Footer/index.tsx"),
    "utf8"
);

const groups = [...footer.matchAll(
    /<div className=\{styles\.linkGroup\}>([\s\S]*?)<\/div>/g
)].map(match => match[1]);

assert.equal(groups.length, 2, "The footer must contain exactly two link groups.");

for (const [index, group] of groups.entries()) {
    const links = (group.match(/<(?:a|button)\b/g) || []).length;
    assert.equal(
        links,
        4,
        `Footer link group ${index + 1} contains ${links} items instead of 4.`
    );
}

assert.ok(
    groups[1].includes('href="/about"'),
    "Sobre NexoChess must be placed in the informational footer column."
);

console.log("Footer verification passed: two balanced groups of four links.");

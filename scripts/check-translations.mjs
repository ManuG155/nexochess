import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const localesRoot = path.join(root, "client", "public", "locales");
const referenceLocale = "en";

function flatten(value, prefix = "", result = new Map()) {
    if (Array.isArray(value)) {
        result.set(prefix, { type: "array", value });
        return result;
    }

    if (value !== null && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
            const next = prefix ? `${prefix}.${key}` : key;
            flatten(child, next, result);
        }
        return result;
    }

    result.set(prefix, { type: typeof value, value });
    return result;
}

function placeholders(value) {
    if (typeof value !== "string") return [];
    return [...value.matchAll(/{{\s*([^},\s]+)(?:,[^}]*)?\s*}}/g)]
        .map((match) => match[1])
        .sort();
}

function sameArray(a, b) {
    return a.length === b.length && a.every((item, index) => item === b[index]);
}

async function readJson(file) {
    try {
        return JSON.parse(await fs.readFile(file, "utf8"));
    } catch (error) {
        throw new Error(`${path.relative(root, file)}: ${error.message}`);
    }
}

const localeEntries = await fs.readdir(localesRoot, { withFileTypes: true });
const locales = localeEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

if (!locales.includes(referenceLocale)) {
    throw new Error(`Reference locale "${referenceLocale}" does not exist.`);
}

const referenceDir = path.join(localesRoot, referenceLocale);
const referenceFiles = (await fs.readdir(referenceDir))
    .filter((file) => file.endsWith(".json"))
    .sort();

const errors = [];
const warnings = [];

for (const locale of locales) {
    const localeDir = path.join(localesRoot, locale);
    const files = (await fs.readdir(localeDir)).filter((file) => file.endsWith(".json")).sort();

    for (const missingFile of referenceFiles.filter((file) => !files.includes(file))) {
        errors.push(`${locale}: missing namespace ${missingFile}`);
    }

    for (const extraFile of files.filter((file) => !referenceFiles.includes(file))) {
        warnings.push(`${locale}: extra namespace ${extraFile}`);
    }

    for (const file of referenceFiles.filter((name) => files.includes(name))) {
        const reference = flatten(await readJson(path.join(referenceDir, file)));
        const translated = flatten(await readJson(path.join(localeDir, file)));

        for (const key of reference.keys()) {
            if (!translated.has(key)) {
                errors.push(`${locale}/${file}: missing key ${key}`);
                continue;
            }

            const expected = reference.get(key);
            const actual = translated.get(key);
            if (expected.type !== actual.type) {
                errors.push(`${locale}/${file}: ${key} has type ${actual.type}, expected ${expected.type}`);
                continue;
            }

            const expectedPlaceholders = placeholders(expected.value);
            const actualPlaceholders = placeholders(actual.value);
            if (!sameArray(expectedPlaceholders, actualPlaceholders)) {
                errors.push(
                    `${locale}/${file}: ${key} uses placeholders [${actualPlaceholders.join(", ")}], expected [${expectedPlaceholders.join(", ")}]`,
                );
            }
        }

        for (const key of translated.keys()) {
            if (!reference.has(key)) {
                errors.push(`${locale}/${file}: unexpected key ${key}`);
            }
        }
    }
}

for (const warning of warnings) console.warn(`WARNING: ${warning}`);

if (errors.length > 0) {
    console.error(`Translation audit failed with ${errors.length} problem(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
}

console.log(`Translation audit passed for ${locales.length} locales and ${referenceFiles.length} namespaces.`);

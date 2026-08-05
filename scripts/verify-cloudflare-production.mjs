if (!process.argv.includes("--environment")) {
    process.argv.push("--environment", "production");
}

await import("./verify-cloudflare-deployment.mjs");

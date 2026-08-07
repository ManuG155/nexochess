import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";

const INSTALLATION_KEY = Symbol.for("nexochess.portable-command-shim");
const originalSpawnSync = childProcess.spawnSync;
export const WRANGLER_PACKAGE = "wrangler@4.119.0";

function pinNpxPackage(commandName, args) {
    if (
        (commandName === "npx" || commandName === "npx.cmd")
        && args[0] === "wrangler"
    ) {
        return [WRANGLER_PACKAGE, ...args.slice(1)];
    }

    return args;
}

export function preparePortableSpawn(
    executable,
    args = [],
    {
        platform = process.platform,
        npmExecPath = process.env.npm_execpath,
        nodeExecutable = process.execPath
    } = {}
) {
    const commandName = basename(String(executable)).toLowerCase();
    const pinnedArgs = pinNpxPackage(commandName, args);

    if (
        platform !== "win32"
        || (commandName !== "npm.cmd" && commandName !== "npx.cmd")
    ) {
        return { executable, args: pinnedArgs };
    }

    if (!npmExecPath) {
        throw new Error(
            "npm_execpath is unavailable. Run Cloudflare operations through the repository npm scripts."
        );
    }

    return {
        executable: nodeExecutable,
        args: commandName === "npx.cmd"
            ? [npmExecPath, "exec", "--", ...pinnedArgs]
            : [npmExecPath, ...pinnedArgs]
    };
}

function portableSpawnSync(executable, args = [], options = {}) {
    const prepared = preparePortableSpawn(executable, args);

    return originalSpawnSync(
        prepared.executable,
        prepared.args,
        options
    );
}

if (!globalThis[INSTALLATION_KEY]) {
    childProcess.spawnSync = portableSpawnSync;
    syncBuiltinESMExports();
    globalThis[INSTALLATION_KEY] = true;
}

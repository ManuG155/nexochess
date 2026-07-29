import express from "express";
import { rateLimit } from "express-rate-limit";
import {
    ClusterMemoryStorePrimary,
    ClusterMemoryStoreWorker
} from "@express-rate-limit/cluster-memory-store";
import cluster from "cluster";
import os from "os";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";

import connectDatabase from "@/database/connect";
import hostnameWhitelist from "@/lib/security/whitelist";
import getAuth from "@/lib/auth";
import mainRouter from "./routes";

dotenv.config();

const port = process.env.PORT || 8080;
const nodeEnv = process.env.NODE_ENV || "production";

const coreCount = os.cpus().length;

async function main() {
    if (cluster.isPrimary) {
        const rateLimitStore = new ClusterMemoryStorePrimary();
        rateLimitStore.init();

        console.log("starting server...");
        for (let i = 0; i < coreCount; i++) cluster.fork();

        return;
    }

    await connectDatabase();

    const app = express();

    const apiRateLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        store: new ClusterMemoryStoreWorker({ prefix: "api" }),
        message: { error: "Too many requests. Please try again later." }
    });

    const authRateLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 20,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        store: new ClusterMemoryStoreWorker({ prefix: "auth" }),
        skipSuccessfulRequests: true,
        message: {
            error: "Too many authentication attempts. Please try again later."
        }
    });

    app.use(cookieParser());
    app.use(hostnameWhitelist);

    // Static assets
    app.use("/",
        express.static("client/dist"),
        express.static("client/public")
    );

    // Normal endpoints
    app.all("/auth/account/*", authRateLimiter, toNodeHandler(getAuth()));
    app.use("/", apiRateLimiter, mainRouter);

    // Start listening for requests
    app.listen(port, () => {
        if (cluster.worker?.id != 1) return;

        console.log(
            `server running on port ${port} `
            + `(${nodeEnv} mode, ${coreCount} thread`
            + (coreCount > 1 ? "s)" : ")")
        );
    });
}

main();

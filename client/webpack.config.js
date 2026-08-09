const { Configuration } = require("webpack");
const { resolve } = require("path");
const DotenvPlugin = require("dotenv-webpack");

require("dotenv").config({ path: "../.env" });

const nodeEnv = process.env.NODE_ENV || "production";
const publicDirectory = resolve("./public");

function publicAssetFilename(pathData) {
    const filename = String(pathData.filename || "").replaceAll("\\", "/");
    const publicMarker = "public/";
    const publicIndex = filename.lastIndexOf(publicMarker);

    return publicIndex >= 0
        ? filename.slice(publicIndex + publicMarker.length)
        : filename.replace(/^\.\//, "");
}

/**
 * @type {Configuration}
 */
module.exports = {
    entry: {
        home: "./src/apps/home/index.tsx",
        about: "./src/apps/about/index.tsx",
        faq: "./src/apps/faq/index.tsx",
        analysis: "./src/apps/features/analysis/index.tsx",
        archive: "./src/apps/features/archive/index.tsx",
        academy: "./src/apps/features/academy/index.tsx",
        puzzles: "./src/apps/features/puzzles/index.tsx",
        guides: "./src/apps/guides/index.tsx",
        news: "./src/apps/features/news/index.tsx",

        signin: "./src/apps/account/signin/index.tsx",
        resetPassword: "./src/apps/account/resetPassword/index.tsx",
        profile: "./src/apps/account/profile/index.tsx",

        helpCenter: "./src/apps/footer/helpCenter/index.tsx",
        legal: "./src/apps/footer/legal/index.tsx",

        settings: "./src/apps/settings/index.tsx",
        internal: "./src/apps/internal/index.tsx",
        unfound: "./src/apps/unfound/index.tsx"
    },
    output: {
        // Entry bundles keep their stable names because the existing HTML files
        // reference them directly. Lazy chunks receive a content hash so every
        // deployment produces a new URL whenever their code or CSS changes.
        filename: "[name].bundle.js",
        chunkFilename: "[name].[contenthash:8].bundle.js",
        path: resolve("./dist"),
        publicPath: "/",
        clean: true
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        alias: {
            "@": resolve("./src"),
            "@analysis": resolve("./src/apps/features/analysis"),
            "@assets": publicDirectory
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/i,
                use: "babel-loader"
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            // Component styles use *.module.css. Files such as
                            // index.css and NexoReview.css are deliberately
                            // global and must keep the class names written in
                            // the markup.
                            modules: {
                                auto: /\.module\.css$/i
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|svg|gif|ttf|mp3)$/i,
                include: publicDirectory,
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024
                    }
                },
                generator: {
                    // client/public is copied verbatim into cloudflare-dist.
                    // Keep small assets inline, but point larger imported assets
                    // at that canonical public copy instead of emitting a second
                    // hashed duplicate into client/dist.
                    emit: false,
                    filename: publicAssetFilename,
                    publicPath: "/"
                }
            },
            {
                test: /\.(png|svg|gif|ttf|mp3)$/i,
                exclude: publicDirectory,
                type: "asset"
            }
        ]
    },
    plugins: [
        new DotenvPlugin({
            systemvars: true,
            path: "../.env",
            silent: true
        })
    ],
    mode: nodeEnv
};
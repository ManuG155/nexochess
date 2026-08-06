const { Configuration } = require("webpack");
const { resolve } = require("path");
const DotenvPlugin = require("dotenv-webpack");

require("dotenv").config({ path: "../.env" });

const nodeEnv = process.env.NODE_ENV || "production";

/**
 * @type {Configuration}
 */
module.exports = {
    entry: {
        home: "./src/apps/home/index.tsx",
        about: "./src/apps/about/index.tsx",
        analysis: "./src/apps/features/analysis/index.tsx",
        archive: "./src/apps/features/archive/index.tsx",
        academy: "./src/apps/features/academy/index.tsx",
        puzzles: "./src/apps/features/puzzles/index.tsx",
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
            "@assets": resolve("./public")
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

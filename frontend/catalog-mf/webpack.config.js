const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

const deps = require("./package.json").dependencies;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

module.exports = {
    mode: "development",
    entry: "./src/index.tsx",

    devServer: {
        port: 3001,
        historyApiFallback: true,
        hot: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Cross-Origin-Resource-Policy": "cross-origin"
        },
        proxy: [
            {
                context: ["/api"],
                target: BACKEND_URL,
                changeOrigin: true,
                pathRewrite: {
                    "^/api/web": ""
                }
            }
        ]
    },

    output: {
        publicPath: "auto",
        clean: true
    },

    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js"]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {
                        configFile: path.resolve(__dirname, "tsconfig.json"),
                        transpileOnly: false
                    }
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },

    plugins: [
        new ModuleFederationPlugin({
            name: "catalog",
            filename: "remoteEntry.js",
            exposes: {
                "./CatalogApp": "./src/CatalogApp.tsx"
            },
            shared: {
                react: {
                    singleton: true,
                    requiredVersion: deps.react
                },
                "react-dom": {
                    singleton: true,
                    requiredVersion: deps["react-dom"]
                }
            }
        }),

        new HtmlWebpackPlugin({
            template: "./public/index.html"
        })
    ]
};
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

const deps = require("./package.json").dependencies;

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";


const remote = (name, url) =>
    `promise new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "${url}/remoteEntry.js";
        script.onload = () => {
            const container = window["${name}"];
            const proxy = {
                get: request => container.get(request),
                init: arg => {
                    try {
                        return container.init(arg);
                    } catch (e) {}
                }
            };
            resolve(proxy);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    })`;

const CATALOG_URL =
    process.env.CATALOG_URL || "http://localhost:3001";

const BORROWING_URL =
    process.env.BORROWING_URL || "http://localhost:3002";

const USERS_URL =
    process.env.USERS_URL || "http://localhost:3003";


module.exports = {
    mode: "development",
    entry: "./src/index.tsx",

    devServer: {
        port: 3004,
        historyApiFallback: true,
        hot: true,
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
            name: "shell",
            remotes: {
                catalog: remote("catalog", CATALOG_URL),
                borrowing: remote("borrowing", BORROWING_URL),
                users: remote("users", USERS_URL)
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
        new HtmlWebpackPlugin({ template: "./public/index.html" })
    ]
};  

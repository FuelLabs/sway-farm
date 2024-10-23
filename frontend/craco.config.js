// craco.config.js

const {
    loaderByName,
    getLoader,
} = require("@craco/craco");

module.exports = {
    typescript: {
        enableTypeChecking: false,
    },
    webpack: {
        configure: function (webpackConfig) {
            const babelLoader = getLoader(
                webpackConfig,
                loaderByName("babel-loader")
            ).match.loader;
            babelLoader.options.presets.push([
                "@babel/preset-typescript",
                { allowDeclareFields: true },
            ]);
            webpackConfig.ignoreWarnings = [
                // You can specify error patterns here to ignore
                {
                    message: /Module not found: Error: Can't resolve/,
                },
                {
                    message: /Failed to parse source map/,
                },
                // Add any other patterns you want to ignore
            ];
            return webpackConfig;
        }
    }
};
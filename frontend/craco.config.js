// craco.config.js

const {
    loaderByName,
    getLoader,
} = require("@craco/craco");

module.exports = {
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

            return webpackConfig;
        }
    }
};
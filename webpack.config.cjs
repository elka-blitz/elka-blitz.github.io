const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: {
		index: './src/index.js',
	},
	module: {
		rules: [
			// Let webpack import images as files/URLs
			{ test: /\.(png|jpe?g|gif|svg)$/i, type: "asset/resource" },

			// (optional) if you later import font files too
			{ test: /\.(woff2?|eot|ttf|otf)$/i, type: "asset/resource" },
		],
	},
	devServer: {
		host: "0.0.0.0",
		server: "https",
		compress: true,
		port: 8081,

		// ✅ static is a top-level devServer option (not inside client)
		static: {
			directory: path.join(__dirname, "dist"),
		},
		// OR if you don't want to serve dist in dev:
		// static: false,

		// ✅ client options only
		client: {
			overlay: { warnings: false, errors: true },
		},

		// ✅ devMiddleware is also top-level (not inside client)
		devMiddleware: {
			publicPath: "/",
		},
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: "/",
		clean: true,
	},
	plugins: [
		new ESLintPlugin({
			extensions: ['js'],
			eslintPath: require.resolve('eslint'),
			overrideConfigFile: path.resolve(__dirname, './eslint.config.cjs'),
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
		}),
		new CopyPlugin({
			patterns: [{ from: 'src/assets', to: 'assets' }],
		}),
	],
	devtool: 'source-map',
};


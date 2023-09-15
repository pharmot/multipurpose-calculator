const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const prodConfig = {
  mode: 'production',
  output: {
    // eslint-disable-next-line no-undef
    path: `${__dirname}/dist`,
    filename: '[name].[contenthash:8].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: { plugins: [["autoprefixer", { }]] },
            },
          },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      linkType: 'text/css',
      filename: 'main.[contenthash:8].min.css',
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: {
        condition: "some",
        filename: (fileData) => {
          return `${fileData.filename}.LICENSE.txt${fileData.query}`;
        },
      },
    })],
    runtimeChunk: 'single',
    moduleIds: 'named',
    chunkIds: 'named',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial',
        },
      },
    },
  },
};


// eslint-disable-next-line no-undef
module.exports = () => {
  return merge(commonConfig, prodConfig);
};


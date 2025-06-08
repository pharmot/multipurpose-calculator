const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const path = require('path');

const devConfig = {
  mode: 'development',
  watchOptions: {
    aggregateTimeout: 2000,
    poll: 1000,
    ignored: [
      '**/node_modules/',
      'docs/',
    ],
  },
  devServer: {
    open: true,
    hot: false,
    port: 9000,
    static: {
      /* eslint-disable-next-line no-undef */
      directory: path.join(__dirname, 'src'),
    },
  },
  output: {
    // eslint-disable-next-line no-undef
    path: `${__dirname}/dist`,
    filename: '[name].dev.js',
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          { loader: 'style-loader' },
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
};
// eslint-disable-next-line no-undef
module.exports = () => {
  return merge(commonConfig, devConfig);
};
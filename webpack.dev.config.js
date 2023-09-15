const { merge } = require('webpack-merge');

const commonConfig = require('./webpack.common.js');

const devConfig = {
  mode: 'development',
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
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './js/main.js',
  mode: 'production',
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
  },
  resolve: {
    alias: {
      jquery: "jquery/src/jquery"
    }
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
  },
};

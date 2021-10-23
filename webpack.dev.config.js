module.exports = {
  entry: './js/main.js',
  mode: 'development',
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
  },
  devtool: "eval-source-map",
  resolve: {
    alias: {
      jquery: "jquery/src/jquery"
    }
  },
};

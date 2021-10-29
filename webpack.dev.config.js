const pjs = require('./package.json');
const thisYear = (new Date()).getFullYear();
const HtmlWebpackPlugin = require ('html-webpack-plugin');

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
              postcssOptions: {
                plugins: [
                  [
                    "autoprefixer",
                    {

                    },
                  ],
                ],
              },
            },
          },
          { loader: 'sass-loader' }
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './template.html',
      templateParameters: {
        buildversion: pjs.version,
        homepage: pjs.homepage,
        issues: pjs.bugs.url,
        thisYear: thisYear
      },
    }),
  ],
};

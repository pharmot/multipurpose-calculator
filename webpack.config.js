const pjs = require('./package.json');
const thisYear = (new Date()).getFullYear();
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require ('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './main.js',
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
    new MiniCssExtractPlugin({
      linkType: 'text/css'
    }),
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
  },
};

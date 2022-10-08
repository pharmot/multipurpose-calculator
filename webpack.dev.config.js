const pjs = require('./package.json');
const thisYear = (new Date()).getFullYear();
const HtmlWebpackPlugin = require ('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const isBeta = /beta/.test(pjs.version);
const betaBanner = isBeta ? `<div class="container-fluid beta-notice"><div class="h6 text-white">TEST RELEASED VERSION ${pjs.version}</div></div>` : '';
const bodyStyle =  isBeta ? `style="border: 4px solid #dc3545;margin:0 auto 70px;"` : '';

module.exports = {
  entry: {
    main: './js/main.js',
    vanco: './js/vanco.js',
    seconddose: './js/seconddose.js'
  },
  mode: 'development',
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].dev.js',
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
              postcssOptions: { plugins: [ [ "autoprefixer", { }, ], ], },
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
        thisYear: thisYear,
        betaBanner: betaBanner,
        bodyStyle: bodyStyle
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "**/*",
          context: `${__dirname}/src`,
        },
      ]
    })
  ],
  performance: {
    maxAssetSize: 250000,
    maxEntrypointSize: 400000,
  }
};

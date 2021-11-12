const pjs = require('./package.json');
const thisYear = (new Date()).getFullYear();
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require ('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const isBeta = /beta/.test(pjs.version);
const betaBanner = isBeta ? `<div class="container-fluid beta-notice"><div class="h6 text-white">TEST RELEASED VERSION ${pjs.version}</div></div>` : '';
const bodyStyle =  isBeta ? `style="border: 4px solid #dc3545;margin:0 auto 70px;"` : '';

module.exports = {
  entry: {
    main: './js/main.js',
    heparin: './js/heparin.js',
    pca: './js/pca.js',
    vanco: './js/vanco.js',
    nextdose: './js/nextdose.js',
    seconddose: './js/seconddose.js'
  },
  mode: 'production',
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].[contenthash:8].js',
    clean: true,
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
              postcssOptions: { plugins: [ [ "autoprefixer", { }, ], ], },
            },
          },
          { loader: 'sass-loader' }
        ],
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      linkType: 'text/css',
      filename: 'main.[contenthash:8].min.css'
    }),
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
        }
      }
    },
  },
};

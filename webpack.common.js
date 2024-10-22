const pjs = require('./package.json');
const thisYear = new Date().getFullYear();
const HtmlWebpackPlugin = require ('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const isBeta = /beta/.test(pjs.version);
const betaBanner = isBeta ? `<div class="container-fluid beta-notice"><div class="h6 text-white">TEST RELEASED VERSION ${pjs.version}</div></div>` : '';
const bodyStyle =  isBeta ? `style="border: 4px solid #dc3545;margin:0 auto 70px;"` : '';

// eslint-disable-next-line no-undef
module.exports = {
  entry: {
    main: './js/main.js',
    amg: './js/amg.js',
    heparin: './js/heparin.js',
    pca: './js/pca.js',
    vanco: './js/vanco.js',
    nextdose: './js/nextdose.js',
    seconddose: './js/seconddose.js',
    alligation: './js/alligation.js',
    ivig: './js/ivig.js',
    kcentra: './js/kcentra.js',
    util: './js/util.js',
    glucommander: {
      import: './js/glucommander.js',
      dependOn: 'main',
    },
  },
  resolve: {
    alias: {
      jquery: "jquery/src/jquery",
    },
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
        bodyStyle: bodyStyle,
      },
      minify: {
        removeRedundantAttributes: false,
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "**/*",
          // eslint-disable-next-line no-undef
          context: `${__dirname}/src`,
        },
      ],
    }),
  ],
  performance: {
    maxAssetSize: 250000,
    maxEntrypointSize: 400000,
  },
};

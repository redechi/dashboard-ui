import autoprefixer from 'autoprefixer';
import { optimize } from 'webpack';
import path from 'path';
import precss from 'precss';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ModernizrWebpackPlugin from 'modernizr-webpack-plugin';

import settings from '../../settings.js';

function makeWebpackConfig() {
  const webpackConfig = {};

  const VENDOR_MODULES = [
    'jquery',
    'react'
  ];

  webpackConfig.resolve = {
    extensions: ['', '.js', '.jsx']
  };

  webpackConfig.context = path.resolve(__dirname, '../../src');
  webpackConfig.entry = {
    main: ['./main.js'],
    vendors: [...VENDOR_MODULES]
  };

  webpackConfig.output = {
    path: path.resolve(__dirname, '../../dist'),
    filename: '[name].js',
    publicPath: settings.DEV_HOT_RELOAD ? `${settings.DEV_WEBPACK_BASE_URL}/` : '/'
  };

  webpackConfig.module = {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules\/(?!(araf)\/).*/
      },
      {
        test: /\.css$/,
        loader: settings.DEV_HOT_RELOAD ?
          'style!css!postcss' :
          ExtractTextPlugin.extract('style', 'css!postcss')
      },
      {
        test: /\.scss$/,
        loader: settings.DEV_HOT_RELOAD ?
          'style!css!postcss!sass' :
          ExtractTextPlugin.extract('style', 'css!postcss!sass')
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=font-[name].[hash].[ext]'
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?name=font-[name].[hash].[ext]'
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/,
        loader: 'url-loader?limit=10000&name=image-[name].[hash].[ext]'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  };

  webpackConfig.postcss = () => [autoprefixer, precss];

  webpackConfig.plugins = [
    new optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    new ModernizrWebpackPlugin({ 'feature-detects': ['cors', 'svg'] }),
    ...(settings.DEV_HOT_RELOAD ? [] : [
      new ExtractTextPlugin('[name].css'),
      new optimize.UglifyJsPlugin()
    ])
  ];

  webpackConfig.devServer = {
    port: settings.DEV_WEBPACK_SERVER_PORT,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    stats: {
      assets: false,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: true,
      chunkModules: false
    }
  };

  webpackConfig.devtool = settings.IS_JENKINS ? 'source-map' : 'cheap-module-eval-source-map';

  return webpackConfig;
}

module.exports = makeWebpackConfig;

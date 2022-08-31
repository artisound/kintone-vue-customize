const VueLoaderPlugin = require('vue-loader/lib/plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');

const config = {
  mode: 'development',
  entry: path.resolve('./source/index.js'),
  resolve: {
    extensions: ['.ts', '.tsx', ".vue", '.js'],
  },
  output: {
    path: __dirname + "/dist",
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: ['vue-loader']
      },
      {
        test: /\.js$/,
        // exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    // Vueを読み込めるようにするため
    new VueLoaderPlugin(),
    new Dotenv(),
  ],
  performance: {
    maxEntrypointSize: 10000000,
    maxAssetSize: 10000000,
  },
  optimization:{
    minimize: false
  }
};

module.exports = (env, argv) => {
  'use strict';
  return [config];
};

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',

  // Our index file
  entry: './src/main.js',
  devtool: 'eval-source-map',
  // Where we put the production code
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      // Allows use of CSS
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              url: false,
            },
          },
          'postcss-loader',
        ],
      },
      // Allows use of modern javascript
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      // Allows use of svelte
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
        },
      },
      // Allows use of images
      {
        test: /\.(jpg|jpeg|png|svg)$/,
        use: 'file-loader',
      },
    ],
  },
  // enables users to leave off the extension when importing
  resolve: {
    extensions: ['.mjs', '.js', '.svelte'],
    fallback: {
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
    },
  },
  plugins: [
    // remove previous build
    new CleanWebpackPlugin(),

    // Allows to create an index.html in our build folder
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
    }),

    // Copies static files to the build folder
    new CopyPlugin({
      patterns: [
        { from: './public/images', to: './images' },
        { from: './public/fonts', to: './fonts' },
      ],
    }),

    // This gets all our css and put in a unique file
    new MiniCssExtractPlugin({
      filename: 'bundle.css',
    }),

    // take our environment variable in .env file
    // And it does a text replace in the resulting bundle for any instances of process.env.
    new Dotenv(),

    // webpack update broke some compatibility
    // keep this in here or I'll come and find you I swear on me mum
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  // Config for webpack-dev-server module
  devServer: {
    port: 5000,
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, 'dist'),
    hot: true,
    stats: {
      warnings: false,
    },
  },
};

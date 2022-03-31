import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import Webpack from 'webpack';
import WebpackDev from 'webpack-dev-server';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import DotEnv from 'dotenv-webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import fs from 'fs';
import path from 'path';
import SvelteCheckPlugin from 'svelte-check-plugin';

/**
 * Babel will compile modern JavaScript down to a format compatible with older browsers, but it will also increase your
 * final bundle size and build speed. Edit the `browserslist` property in the package.json file to define which
 * browsers Babel should target.
 *
 * Browserslist documentation: https://github.com/browserslist/browserslist#browserslist-
 */
const useBabel = true;
/**
 * This option controls whether or not development builds should be compiled with Babel. Change this to `true` if you
 * intend to test with older browsers during development, but it could significantly impact your build speed.
 */
const useBabelInDevelopment = false;

/**
 * Change this to `false` to disable svelte-check during production builds. Build speeds will be faster, but error
 * and warning checks will be less thorough.
 */
const svelteCheckInProduction = true;

/**
 * Change this to `true` to run svelte-check during hot reloads. This will impact build speeds but will show more
 * thorough errors and warnings.
 */
const svelteCheckInDevelopment = false;

const mode = process.env.NODE_ENV ?? 'development';
const isProduction = mode === 'production';
const isDevelopment = !isProduction;

export interface Configuration extends Webpack.Configuration, WebpackDev.Configuration {}

const config: Configuration = {
  mode: 'development',
  entry: './src/main.ts',
  devtool: 'source-map',
  stats: {
    warnings: false,
    errorDetails: true,
  },
  resolve: {
    fallback: {
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
    },
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.mjs', '.ts', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    port: 5000,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    hot: true,
    client: {
      overlay: {
        warnings: false,
      },
    },
  },
  module: {
    rules: [
      // Rule: Svelte
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            compilerOptions: {
              dev: true,
            },
            emitCss: true,
            hotReload: true,
            hotOptions: {
              // List of options and defaults: https://www.npmjs.com/package/svelte-loader-hot#usage
              noPreserveState: false,
              optimistic: true,
            },
          },
        },
      },
      //Rule: mjs
      // Required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
      // See: https://github.com/sveltejs/svelte-loader#usage
      {
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false,
        },
      },
      // Rule: CSS
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
      // Rule: TypeScript
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
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
        { from: './public/sounds', to: './sounds' },
      ],
    }),

    // This gets all our css and put in a unique file
    new MiniCssExtractPlugin({
      filename: 'bundle.css',
    }),

    // take our environment variable in .env file
    // And it does a text replace in the resulting bundle for any instances of process.env.
    new DotEnv({}),

    // webpack update broke some compatibility
    // keep this in here or I'll come and find you I swear on me mum
    new Webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),

    ...(svelteCheckInDevelopment || (isProduction && svelteCheckInProduction)
      ? [new SvelteCheckPlugin()]
      : []),
  ],
};

// Parse as JSON5 to add support for comments in tsconfig.json parsing.
require('require-json5').replace();

// Load path aliases from the tsconfig.json file
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');
const tsconfig = fs.existsSync(tsconfigPath) ? require(tsconfigPath) : {};

if ('compilerOptions' in tsconfig && 'paths' in tsconfig.compilerOptions) {
  const aliases = tsconfig.compilerOptions.paths;

  for (const alias in aliases) {
    const paths = aliases[alias].map((p: string) => path.resolve(__dirname, p));

    // Our tsconfig uses glob path formats, whereas webpack just wants directories
    // We'll need to transform the glob format into a format acceptable to webpack

    const wpAlias = alias.replace(/(\\|\/)\*$/, '');
    const wpPaths = paths.map((p: string) => p.replace(/(\\|\/)\*$/, ''));

    if (config.resolve && config.resolve.alias) {
      if (!(wpAlias in config.resolve.alias) && wpPaths.length) {
        config.resolve.alias[wpAlias] = wpPaths.length > 1 ? wpPaths : wpPaths[0];
      }
    }
  }
}

// Babel
if (useBabel && (isProduction || useBabelInDevelopment)) {
  const loader = {
    loader: 'babel-loader',
    options: {
      sourceType: 'unambiguous',
      presets: [
        [
          // Docs: https://babeljs.io/docs/en/babel-preset-env
          '@babel/preset-env',
          {
            debug: false,
            corejs: { version: 3 },
            useBuiltIns: 'usage',
          },
        ],
      ],
      plugins: ['@babel/plugin-transform-runtime'],
    },
  };

  config.module?.rules.unshift({
    test: /\.(?:m?js|ts)$/,
    include: [path.resolve(__dirname, 'src'), path.resolve('node_modules', 'svelte')],
    exclude: [/node_modules[/\\](css-loader|core-js|webpack|regenerator-runtime)/],
    use: loader,
  });

  const svelte = config.module?.rules.find((rule) => {
    if (typeof rule !== 'object') return false;
    else if (Array.isArray(rule.use))
      return rule.use.includes(
        (e: any) => typeof e.loader === 'string' && e.loader.startsWith('svelte-loader'),
      );
    else if (typeof rule.use === 'object') return rule.use.loader?.startsWith('svelte-loader') ?? false;
    return false;
  }) as Webpack.RuleSetRule;

  if (!svelte) {
    console.error('ERR: Could not find svelte-loader for babel injection!');
    process.exit(1);
  }

  if (!Array.isArray(svelte.use)) {
    svelte.use = [svelte.use as any];
  }

  svelte.use.unshift(loader);
}

export default config;

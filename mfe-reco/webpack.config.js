const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
    port: 3003,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'shared': path.resolve(__dirname, '../shared'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      // TODO: configurer ce MFE pour exposer le composant Recommendations
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};

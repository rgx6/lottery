// output.pathに絶対パスを指定する必要があるため、pathモジュールを読み込んでおく
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { webpack } = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/js/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js?[contenthash]'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { url: false }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './src/html/index.html',
      filename: 'index.html',
    })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    open: true
  }
};

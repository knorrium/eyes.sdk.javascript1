import path from 'path'
import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'

export default {
  mode: 'development',
  context: __dirname,
  devtool: false,
  entry: {
    content: ['./src/content'],
    background: ['./src/background'],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    publicPath: '/assets/',
    libraryTarget: 'umd',
    clean: true,
  },
  target: ['webworker'],
  resolve: {
    extensions: ['.js', '.json'],
    mainFields: ['browser', 'main'],
    alias: {
      buffer: require.resolve('buffer/'),
    },
  },
  plugins: [
    new CopyWebpackPlugin({patterns: [{from: './manifest.json', to: './'}]}),
    new webpack.ProvidePlugin({
      setImmediate: [require.resolve('core-js/features/set-immediate')],
    }),
  ],
}

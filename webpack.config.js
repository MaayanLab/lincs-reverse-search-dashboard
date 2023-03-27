const path = require('path')
const webpack = require('webpack')

const common = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            envName: 'production',
          }
        }
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
}

module.exports = [
  {
    target: 'web',
    entry: './src/client.jsx',
    output: {
      filename: 'client.js',
      path: path.resolve('dist'),
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.ENDPOINT_URL': '',
      }),
    ],
    ...common,
  },
  {
    target: 'node',
    entry: './src/server.jsx',
    output: {
      filename: 'server.js',
      path: path.resolve('dist'),
    },
    externals: {
      canvas: 'commonjs canvas',
    },
    ...common,
  }
]

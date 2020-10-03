const path = require('path')

module.exports = {
  entry: './public/js/sketch.js',
  output: {
    filename: 'game.bundle.js',
    path: path.resolve(__dirname, 'dist')
  }, 
  optimization: {
    minimize: false
  }
}
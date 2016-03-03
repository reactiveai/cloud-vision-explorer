'use strict'
const gulp       = require('gulp')
const supervisor = require('gulp-supervisor')
const plumber    = require('gulp-plumber')
const eslint     = require('gulp-eslint')
const jasmine    = require('gulp-jasmine')
const seq        = require('run-sequence')
const webpack    = require('webpack')
const wpStream   = require('webpack-stream')

const CLIENT_JS_ENTRY_POINT = 'public/javascripts/main.js'

gulp.task('default', () => {
  seq('lint', 'test', ['server', 'webpack'])
})

gulp.task('server', () => {
  supervisor('server.js', {
    ignore: ['public']
  })
})

gulp.task('test', () => {
  process.env.NODE_ENV = 'test'
  return gulp.src('spec/**/*.spec.js')
  .pipe(jasmine())
})

gulp.task('lint', () => {
  return gulp.src([
    '*.js',
    '!newrelic.js',
    'routes/**/*.js',
    'public/javascripts/**/*.js',
    '!public/javascripts/bundle.js'
  ])
  .pipe(eslint({configFile: '.eslintrc.json'}))
  .pipe(eslint.format())
  // .pipe(eslint.failOnError())
})

const buildClient = (doesWatch) => {
  return gulp.src(CLIENT_JS_ENTRY_POINT)
    .pipe(plumber())
    .pipe(wpStream({
      watch: doesWatch,
      output: { filename: 'bundle.js' },
      plugins: [
        new webpack.DefinePlugin({
          // 'process.env': { 'FOO': JSON.stringify(process.env.FOO) }
        })
      ],
      module: {
        loaders: [{
          loader: 'babel',
          exclude: /node_modules/,
          test: /\.js[x]?$/,
          query: {
            cacheDirectory: false,
            presets: ['react', 'es2015']
          }
        }]
      }
    }))
    .pipe(gulp.dest('public/javascripts/'))
}

gulp.task('build', () => {
  return buildClient(false)
})

gulp.task('webpack', () => {
  return buildClient(true)
})

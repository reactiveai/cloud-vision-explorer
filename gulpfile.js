'use strict'
const gulp          = require('gulp')
const gutil         = require('gulp-util')
const plumber       = require('gulp-plumber')
const eslint        = require('gulp-eslint')
const jasmine       = require('gulp-jasmine')
const seq           = require('run-sequence')
const webpack       = require('webpack')
const wpStream      = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')
const wDevServer    = require('webpack-dev-server')

const CLIENT_JS_ENTRY_POINT = 'src/javascripts/main.js'

gulp.task('default', () => {
  seq('lint', 'test', 'webpack-dev-server')
})

gulp.task('build', () => {
  seq('lint', 'test', '_build')
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
    'src/javascripts/**/*.js',
    '!build/**/bundle.js'
  ])
  .pipe(eslint({configFile: '.eslintrc.json'}))
  .pipe(eslint.format())
  // .pipe(eslint.failOnError())
})

gulp.task('_build', () => {
  return gulp.src(CLIENT_JS_ENTRY_POINT)
    .pipe(plumber())
    .pipe(wpStream(webpackConfig))
    .pipe(gulp.dest('build/prod/'))
})

gulp.task('webpack-dev-server', () => {
  // Start a webpack-dev-server
  new wDevServer(webpack(webpackConfig), {
    contentBase: 'build/dev/',
    stats: {
      colors: true
    }
  }).listen(3000, 'localhost', (err) => {
    if(err) throw new gutil.PluginError('webpack-dev-server', err)
    // Server listening
    gutil.log('[webpack-dev-server]', 'http://localhost:3000/webpack-dev-server/index.html')
  })
})

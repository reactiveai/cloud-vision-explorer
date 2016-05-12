'use strict'
const gulp          = require('gulp')
const gutil         = require('gulp-util')
const plumber       = require('gulp-plumber')
const eslint        = require('gulp-eslint')
const seq           = require('run-sequence')
const webpack       = require('webpack')
const wpStream      = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')
const wDevServer    = require('webpack-dev-server')

const CLIENT_JS_ENTRY_POINT = 'src/javascripts/main.js'

gulp.task('default', () => {
  seq('lint', 'webpack-dev-server')
})

gulp.task('build', () => {
  seq('lint', '_build')
})

gulp.task('lint', () => {
  return gulp.src([
    '*.js',
    'src/javascripts/**/*.js',
    '!build'
  ])
  .pipe(eslint({configFile: '.eslintrc.json'}))
  .pipe(eslint.format())
  // .pipe(eslint.failOnError())
})

gulp.task('_build', () => {
  gulp.src('public/**/*').pipe(gulp.dest('build/prod'))

  return gulp.src(CLIENT_JS_ENTRY_POINT)
    .pipe(plumber())
    .pipe(wpStream(webpackConfig))
    .pipe(gulp.dest('build/prod/'))
})

gulp.task('webpack-dev-server', () => {
  gulp.src('public/**/*').pipe(gulp.dest('build/dev'))

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

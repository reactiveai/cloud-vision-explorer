'use strict'
const gulp          = require('gulp')
const supervisor    = require('gulp-supervisor')
const plumber       = require('gulp-plumber')
const eslint        = require('gulp-eslint')
const jasmine       = require('gulp-jasmine')
const seq           = require('run-sequence')
const wpStream      = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')

const CLIENT_JS_ENTRY_POINT = 'src/javascripts/main.js'

gulp.task('default', () => {
  seq('lint', 'test', ['server', 'server-hot-reload'])
})

gulp.task('server', () => {
  supervisor('server.js', {
    ignore: ['public', 'node_modules']
  })
})

gulp.task('server-hot-reload', () => {
  supervisor('server.dev.js', {
    ignore: ['public', 'node_modules']
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
    'src/javascripts/**/*.js',
    '!public/bundle.js'
  ])
  .pipe(eslint({configFile: '.eslintrc.json'}))
  .pipe(eslint.format())
  // .pipe(eslint.failOnError())
})

gulp.task('build', () => {
  return gulp.src(CLIENT_JS_ENTRY_POINT)
    .pipe(plumber())
    .pipe(wpStream(webpackConfig))
    .pipe(gulp.dest('public/'))
})

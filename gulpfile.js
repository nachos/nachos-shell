/** Regular npm dependendencies */
var gulp = require('gulp');
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var exec = childProcess.exec;
var nw = require('nw');
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');
var del = require('del');
var stylish = require('jshint-stylish');

/** Gulp dependencies */
var gutil = require('gulp-util');
var inject = require('gulp-inject');
var less = require('gulp-less');
var jshint = require('gulp-jshint');

/** Grab-bag of build configuration. */
var config = {};

/** Gulp tasks */

gulp.task('default', ['test']);

gulp.task('test', ['jshint']);

gulp.task('jshint', function () {
  gulp.src(['./client/**/*.js', '!./client/bower_components/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('nw', function (cb) {
  var process = spawn(nw.findpath(), ['client']);

  process.on('error', cb);
  process.on('close', function (code) {
    if (code) {
      cb(new Error('child process exited with code ' + code))
    }

    cb();
  });
});

gulp.task('serve', function (cb) {
  runSequence(
    'clean:tmp',
    'less',
    'inject:css',
    'inject:js',
    'wiredep',
    'nw',
    cb);
});

gulp.task('wiredep', function () {
  gulp.src('client/index.html')
    .pipe(wiredep({
      ignorePath: 'client/',
      exclude: [/font-awesome.css/]
    }))
    .pipe(gulp.dest('client'));
});

gulp.task('less', ['inject:less'], function () {
  return gulp.src([
      'client/app/app.less',
      'client/app/**/*.less'
    ])
    .pipe(less({
      paths: [
        'client/bower_components',
        'client/app',
        'client/components'
      ]
    }))
    .pipe(gulp.dest('client/.tmp/app'));
});

gulp.task('inject:less', function () {
  return gulp.src('client/app/app.less')
    .pipe(inject(gulp.src([
      'client/{app,components}/**/*.less'
    ], {read: false}), {
      transform: function (filePath) {
        filePath = filePath.replace('/client/app/', '');
        filePath = filePath.replace('/client/components/', '');
        return '@import \'' + filePath + '\';';
      },
      starttag: '// injector',
      endtag: '// endinjector'
    }))
    .pipe(gulp.dest('client/app'));
});

gulp.task('inject:css', function () {
  return gulp.src('client/index.html')
    .pipe(inject(gulp.src([
      'client/{app,components}/**/*.css'
    ], {read: false}), {
      transform: function (filePath) {
        filePath = filePath.replace('/client/', '');
        filePath = filePath.replace('/.tmp/', '');
        return '<link rel="stylesheet" href="' + filePath + '">';
      },
      starttag: '<!-- injector:css -->',
      endtag: '<!-- endinjector -->'
    }))
    .pipe(gulp.dest('client'));
});

gulp.task('inject:js', function () {
  return gulp.src('client/index.html')
    .pipe(inject(gulp.src([
      'client/{app,components}/**/*.js',
      '!client/app/app.js',
      '!client/{app,components}/**/*.spec.js',
      '!client/{app,components}/**/*.mock.js'
    ], {read: false}), {
      transform: function (filePath) {
        filePath = filePath.replace('/client/', '');
        return '<script src="' + filePath + '"></script>';
      },
      starttag: '<!-- injector:js -->',
      endtag: '<!-- endinjector -->'
    }))
    .pipe(gulp.dest('client'));
});

gulp.task('clean', ['clean:tmp', 'clean:dist']);

gulp.task('clean:tmp', function (cb) {
  del(['.tmp'], cb);
});

gulp.task('clean:dist', function (cb) {
  del(['dist'], cb);
});
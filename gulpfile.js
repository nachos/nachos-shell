/** Regular npm dependendencies */
var gulp = require('gulp');
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var gulpExec = require('gulp-exec');
var nw = require('nw');
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');
var del = require('del');
var stylish = require('jshint-stylish');
var nwBuilder = require('node-webkit-builder');
var rimraf = require('rimraf');
var ncp = require('ncp');
var path = require('path');
var mkdirp = require('mkdirp');

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
  var nwProcess = spawn(nw.findpath(), ['client']);

  nwProcess.on('error', cb);
  nwProcess.on('close', function (code) {
    if (code) {
      cb(new Error('child process exited with code ' + code))
    }

    cb();

    // Close gulp
    process.exit(1);
  });
});

gulp.task('build:nw', function (cb) {
  // Read package.json
  var pkg = require('./package.json');

  // Find out which modules to include
  var modules = [];
  if (!!pkg.dependencies) {
    modules = Object.keys(pkg.dependencies)
      .filter(function(m) { return m != 'nodewebkit' })
      .map(function(m) { return './node_modules/'+m+'/**/*' })
  }

  // Which platforms should we build
  var platforms = ['win', 'osx', 'linux'];

  var nw = new nwBuilder({
    files: [ './client/**/*' ].concat(modules),
    version: '0.12.0',
    cacheDir: './build/cache',
    platforms: platforms,
    //macIcns: './app/assets/icons/mac.icns',
    //winIco: './app/assets/icons/windows.ico',
    checkVersions: false
  });

  nw.on('log', function(msg) {
    // Ignore 'Zipping... messages
    if (msg.indexOf('Zipping') !== 0) console.log(msg)
  });

  // Build!
  nw.build(function(err) {
    if (err) return console.error(err);
/*
    // Handle ffmpeg for Windows
    if (platforms.indexOf('win') > -1) {
      gulp.src('./deps/ffmpegsumo/win/*')
        .pipe(gulp.dest(
          './build/'+package.name+'/win'
        ))
    }

    // Handle ffmpeg for Mac
    if (platforms.indexOf('osx') > -1) {
      gulp.src('./deps/ffmpegsumo/osx/*')
        .pipe(gulp.dest(
          './build/'+package.name+'/osx/node-webkit.app/Contents/Frameworks/node-webkit Framework.framework/Libraries'
        ))
    }

    // Handle ffmpeg for Linux32
    if (platforms.indexOf('linux32') > -1) {
      gulp.src('./deps/ffmpegsumo/linux32/*')
        .pipe(gulp.dest(
          './build/'+package.name+'/linux32'
        ))
    }

    // Handle ffmpeg for Linux64
    if (platforms.indexOf('linux64') > -1) {
      gulp.src('./deps/ffmpegsumo/linux64/*')
        .pipe(gulp.dest(
          './build/'+package.name+'/linux64'
        ))
    }*/

    cb(err);
  })
});

gulp.task('serve', function (cb) {
  runSequence(
    'build',
    ['nw', 'watch'],
    cb);
});

gulp.task('watch', function () {
  return gulp.watch([
      'nachos-home/**/*'
    ],
    function (event) {
      console.log('nachos-home changed!');
      // No native api so write it hard coded..
      var userHome = 'C:\\Users\\Elad';
      var nachosHome = path.join(userHome, '.nachos');

      rimraf.sync(path.join(nachosHome, 'dips'));
      rimraf.sync(path.join(nachosHome, 'apps'));

      mkdirp(nachosHome, function () {
        ncp('nachos-home', nachosHome, function () {
          console.log('Copied successfully');
        });
      });
    });
});

gulp.task('serve:dist', function (cb) {
  runSequence(
    'build',
    'nw-gyp',
    'build:nw',
    cb);
});

gulp.task('build', function (cb) {
  runSequence(
    'clean:tmp',
    'less',
    'inject:css',
    'inject:js',
    'wiredep',
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
      'client/{app,components}/**/*.less',
      '!client/app/app.less'
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

gulp.task('nw-gyp', function(){
  var nwVersion = '0.12.0';

  var execOptions = {
    continueOnError: false,
    pipeStdout: false
  };
  var reportOptions = {
    err: true,
    stderr: true,
    stdout: true
  };

  var pkg = require('./package.json');
  var modules = [];
  if(!!pkg.dependencies){
    modules = Object.keys(pkg.dependencies)
      .filter(function(m){
        return m != 'nw'
      })
      .map(function(m){
        return './node_modules/' + m + '/binding.gyp'
      });
  }

  return gulp.src(modules)
    .pipe(gulpExec(
      'cd "<%= file.path %>/../"' +
      ' && nw-gyp configure --target=' + nwVersion +
      ' && nw-gyp build'
    ), execOptions)
    .pipe(gulpExec.reporter(reportOptions));
});
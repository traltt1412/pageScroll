const gulp = require('gulp');
const babel = require('gulp-babel');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const merge = require('merge-stream');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

let dev = true;
let assetPath = 'assets';
let config = {
  "src": {
    "css": "app/"+ assetPath +"/css/app.scss",
    "js": "app/"+ assetPath +"/js/*.js",
    "scripts": "app/"+ assetPath +"/scripts/*.js",
    "fonts": "app/"+ assetPath +"/fonts/*.ttf"
  },
  "tmp": {
    "css": ".tmp/"+ assetPath +"/css",
    "js": ".tmp/"+ assetPath +"/js",
    "scripts": ".tmp/"+ assetPath +"/scripts",
    "scripts_es5": ".tmp/"+ assetPath +"/scripts_es5",
    "fonts": ".tmp/"+ assetPath +"/fonts"
  },
  "dist": {
    "css": "dist/"+ assetPath +"/css",
    "js": "dist/"+ assetPath +"/js",
    "scripts": "dist/"+ assetPath +"/scripts",
    "scripts_es5": "dist/"+ assetPath +"/scripts_es5",
    "fonts": "dist/"+ assetPath +"/fonts",
    "img": "dist/"+ assetPath +"/images"
  }
};

gulp.task('css', () => {
  return gulp.src(config.src.css)
    .pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.message %>')}))
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.sassGlob({
      ignorePaths: [
        '**/_global.scss'
      ]
    }))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 5 versions', 'Firefox ESR']}))
    .pipe($.if(dev, $.sourcemaps.write('.'), $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if(dev, gulp.dest(config.tmp.css), gulp.dest(config.dist.css)))
    .pipe($.plumber.stop())
    .pipe(reload({stream: true}));
});

gulp.task('twig-watch', ['twig'], function (done) {
  browserSync.reload();
  done();
});
gulp.task('js-watch', ['js'], function (done) {
  browserSync.reload();
  done();
});
gulp.task('scripts-watch', ['scripts'], function (done) {
  browserSync.reload();
  done();
});

gulp.task('js', () => {
  return gulp.src(config.src.js)
    .pipe($.plumber({
      errorHandler: function(err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(webpackStream(require('./webpack.dev.js'), webpack))
    .pipe(gulp.dest(config.tmp.js))
    .pipe($.plumber.stop());
});

gulp.task('scripts', () => {
  return gulp.src(config.src.scripts)
    .pipe($.plumber({
      errorHandler: function(err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(gulp.dest(config.tmp.scripts))
    .pipe($.plumber.stop());
});

gulp.task('transpile', function(){
  return gulp.src(config.src.scripts)
    .pipe(babel({
      "presets": ["es2015"]
    }))
    .pipe(gulp.dest(config.tmp.scripts_es5))
    .pipe($.plumber.stop());
});

gulp.task('build:css', () => {
  dev = false;
  gulp.start('css');
});

gulp.task('build:js', () => {
  return gulp.src(config.src.js)
    .pipe($.plumber({
      errorHandler: function(err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(webpackStream(require('./webpack.prod.js'), webpack))
    .pipe(gulp.dest(config.dist.js))
    .pipe($.plumber.stop());
});

gulp.task('build:scripts', () => {
  return gulp.src(config.src.scripts)
    .pipe($.plumber({
      errorHandler: function(err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(gulp.dest(config.dist.scripts))
    .pipe($.plumber.stop());
});

gulp.task('html', ['css', 'build:js', 'build:scripts'], () => {
  let indexTwig = gulp.src([
    'app/index.twig',
    '!app/'+ assetPath +'/**'
    ])
    .pipe($.data(function(file) {
      return JSON.parse(fs.readFileSync('./app/_data/app.json', 'utf-8'));;
    }))
    .pipe($.twig())
    .pipe($.useref({searchPath: ['app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if(/\.css$/, $.cssnano({safe: true, autoprefixer: false})))
    .pipe(gulp.dest('dist'));

  let othersTwig = gulp.src([
    '!app/index.twig',
    'app/*.twig',
    '!app/'+ assetPath +'/**'
    ])
    .pipe($.data(function(file) {
      return JSON.parse(fs.readFileSync('./app/_data/app.json', 'utf-8'));;
    }))
    .pipe($.twig())
    .pipe($.useref({
      noAssets: true,
      searchPath: ['app', '.']
    }))
    .pipe(gulp.dest('dist'));

  return merge(indexTwig, othersTwig);
});

gulp.task('images', () => {
  return gulp.src([
    'app/'+ assetPath +'/images/**/*',
    '!app/'+ assetPath +'/images/sprites-retina',
    '!app/'+ assetPath +'/images/sprites',
    '!app/'+ assetPath +'/images/sprites-retina/**',
    '!app/'+ assetPath +'/images/sprites/**'
    ])
    .pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.message %>')}))
    .pipe(gulp.dest(config.dist.img))
    .pipe($.plumber.stop());
});

gulp.task('sprite', function () {
  let retinaSpriteData = gulp.src('app/'+ assetPath +'/images/sprites-retina/*.*')
  .pipe($.spritesmith({
    retinaSrcFilter: ['app/'+ assetPath +'/images/sprites-retina/*@2x.png'],
    imgName: 'sprites-retina.png',
    retinaImgName: 'sprites-retina@2x.png',
    cssName: '_retinaSprites.css',
    padding: 5,
    imgPath: ('../images/sprites-retina.png?t=' + (new Date()).getTime()),
    retinaImgPath: ('../images/sprites-retina@2x.png?t=' + (new Date()).getTime())
  }));

  let spriteData = gulp.src('app/'+ assetPath +'/images/sprites/*.*')
  .pipe($.spritesmith({
    imgName: 'sprites.png',
    cssName: '_sprites.css',
    padding: 5,
    imgPath: ('../images/sprites.png?t=' + (new Date()).getTime())
  }));

  // Output our images
  let retinaSpritesImgStream  = retinaSpriteData.img.pipe(gulp.dest('app/'+ assetPath +'/images'));
  let spritesImgStream        = spriteData.img.pipe(gulp.dest('app/'+ assetPath +'/images'));

  // Concatenate our CSS streams
  let cssStream = merge(retinaSpriteData.css, spriteData.css)
  .pipe($.concat('_all-sprites.scss'))
  .pipe(gulp.dest('app/'+ assetPath +'/css/base'));

  // Return a merged stream to handle all our `end` events
  return merge(retinaSpritesImgStream, spritesImgStream, cssStream);
});

gulp.task('fonts', function() {
  gulp.src('app/'+ assetPath +'/fonts/*.*')
  .pipe($.if(dev, gulp.dest('.tmp/'+ assetPath +'/fonts/'), gulp.dest('dist/'+ assetPath +'/fonts/')));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/**/*.twig',
    '!app/_templates',
    '!app/_templates/**',
    '!app/_data',
    '!app/_data/**',
    '!app/'+ assetPath +'/images/sprites-retina',
    '!app/'+ assetPath +'/images/sprites',
    '!app/'+ assetPath +'/images/sprites-retina/**',
    '!app/'+ assetPath +'/images/sprites/**',
    '.tmp/assets/scripts_es5/*.*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('twig', function () {
  return gulp.src('app/*.twig')
    .pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.message %>')}))
    .pipe($.data(function(file) {
      return JSON.parse(fs.readFileSync('./app/_data/app.json', 'utf-8'));
    }))
    .pipe($.twig())
    .pipe(gulp.dest('.tmp/'))
    .pipe($.plumber.stop());
});

gulp.task('clean', function() {
  return gulp.src(['.tmp/', 'dist/'], { read: false })
    .pipe($.rimraf({
      force: true
    }));
});

gulp.task('serve', () => {
  runSequence(['wiredep', 'twig', 'sprite'], ['css', 'js', 'scripts', 'transpile', 'fonts'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      reloadDelay: 100,
      logLevel: 'info',
      online: true,
      open: 'external',
      server: {
        baseDir: ['.tmp', 'app'],
        directory: true,
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch([
      'app/'+ assetPath +'/images/**/*',
      '.tmp/'+ assetPath +'/fonts/**/*'
    ]).on('change', reload);

    gulp.watch(['app/**/*.twig', 'app/_data/app.json'], ['twig-watch']);
    gulp.watch('app/'+ assetPath +'/css/**/*.scss', ['css']);
    gulp.watch('app/'+ assetPath +'/js/**/*.js', ['js-watch']);
    gulp.watch('app/'+ assetPath +'/scripts/**/*.js', ['scripts-watch']);
    gulp.watch('app/'+ assetPath +'/images/icons/**/*.png', ['sprite']);
    gulp.watch('app/'+ assetPath +'/images/sprites/**/*.png', ['sprite']);
    gulp.watch('app/'+ assetPath +'/fonts/**/*', ['fonts']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
  });
});

// inject bower components
gulp.task('wiredep', () => {
  // gulp.src('app/'+ assetPath +'/css/*.scss')
  //   .pipe(wiredep({
  //     ignorePath: /^(\.\.\/)+/
  //   }))
  //   .pipe(gulp.dest('app/'+ assetPath +'/css'));

  // gulp.src('app/**/*.twig')
  //   .pipe(wiredep({
  //     ignorePath: /^(\.\.\/)*\.\./
  //   }))
  //   .pipe(gulp.dest('app'));
});

gulp.task('build', () => {
  runSequence(['wiredep', 'sprite'], ['html', 'images', 'fonts', 'extras'], () => {
    return gulp.src('dist/**/*');
  });
});

gulp.task('default', ['clean'], () => {
  dev = false;
  gulp.start('build');
});

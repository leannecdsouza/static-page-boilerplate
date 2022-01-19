const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const cssmin = require('gulp-cssmin');
const htmlPartial = require('gulp-html-partial');
const jsImport = require('gulp-js-import');
const rtlcss = require('gulp-rtlcss');
const sourcemaps = require('gulp-sourcemaps');

const gulpIf = require('gulp-if');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');

const isProd = process.env.NODE_ENV === 'prod';
const htmlFile = ['src/*.html']

function html() {
  return gulp.src(htmlFile).pipe(htmlPartial({
    basePath: 'src/html-templates/partials/'
  }))
  .pipe(gulpIf(isProd, htmlmin({
      collapseWhitespace: true
  })))
  .pipe(gulp.dest('dist'));
}

function css() {
  return gulp.src('src/sass/style.scss')
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(sass({
        includePaths: ['node_modules']
    }).on('error', sass.logError))
    .pipe(gulpIf(!isProd, sourcemaps.write()))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(gulpIf(isProd, cssmin()))
    .pipe(gulp.dest('dist/css/'))
    .pipe(rtlcss())
    .pipe(rename({ suffix: '-ar' }))
    .pipe(gulp.dest('dist/css/'))
}

function js() {
  return gulp.src('src/js/index.js')
    .pipe(jsImport({
        hideConsole: true
    }))
    .pipe(babel({
      presets: ['babel-preset-env']
    }))
    .pipe(concat('script.js'))
    .pipe(gulpIf(isProd, uglify()))
    .pipe(gulp.dest('dist/js'));
}

function img() {
  return gulp.src('src/img/*')
    .pipe(gulpIf(isProd, imagemin()))
    .pipe(gulp.dest('dist/img/'));
}

function serve() {
  browserSync.init({
    open: true,
    server: './dist'
  });
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}


function watchFiles() {
  gulp.watch('src/**/*.html', gulp.series(html, browserSyncReload));
  gulp.watch('src/**/*.scss', gulp.series(css, browserSyncReload));
  gulp.watch('src/**/*.js', gulp.series(js, browserSyncReload));
  gulp.watch('src/img/**/*.*', gulp.series(img));

  return;
}

function del() {
  return gulp.src('dist/*', {read: false})
    .pipe(clean());
}

exports.css = css;
exports.html = html;
exports.js = js;
exports.del = del;
exports.serve = gulp.parallel(html, css, js, img, watchFiles, serve);
exports.default = gulp.series(del, html, css, js, img);
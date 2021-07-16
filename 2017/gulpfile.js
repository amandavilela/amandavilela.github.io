const gulp = require('gulp'),
      autoprefixer = require('gulp-autoprefixer'),
      sass = require('gulp-sass'),
      browserSync = require('browser-sync').create(),
      minify = require('gulp-minify-css');


gulp.task('dependencies', () => {
  gulp.src('node_modules/normalize-scss/_normalize.scss')
  .pipe(gulp.dest('./scss/libs/'));
});

gulp.task('styles', () => {
  gulp.src('scss/style.scss')
  .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
  .pipe(autoprefixer({browsers: ['last 10 versions'], cascade: false}))
  .pipe(gulp.dest('css/'));
});

gulp.task('default', () => {
  browserSync.init({server: "./"});
  gulp.watch("scss/**/*.scss", ['styles']);
  gulp.watch(["index.html", "css/*.css"]).on('change', browserSync.reload);
});

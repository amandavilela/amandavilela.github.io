var gulp = require('gulp'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    prefixer = require('gulp-autoprefixer'),
    minify = require('gulp-minify-css');

gulp.task('dependencies', function(){
  gulp.src('bower_components/normalize-css/normalize.css')
  .pipe(rename('_normalize.scss'))
  .pipe(gulp.dest('scss/libs'));
});

gulp.task('sass', function() {
    gulp.src('scss/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('css/'))
    .pipe(minify({compatibility: 'ie8'}))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('css/'))
});

gulp.task('watch', function(){
  gulp.watch('scss/**/*.scss', ['sass']);
})

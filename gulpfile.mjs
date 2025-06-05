import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import mozjpeg from 'imagemin-mozjpeg';
import optipng from 'imagemin-optipng';
import svgo from 'imagemin-svgo';
import sourcemaps from 'gulp-sourcemaps';
import concat from 'gulp-concat';
import connect from 'gulp-connect';
import { deleteAsync } from 'del';
import fileInclude from 'gulp-file-include'; // Import gulp-file-include

const { src, dest, watch, series, parallel } = gulp;

async function clean() {
  await deleteAsync(['dist']);
}

function html() {
  return src('src/**/*.html', { base: 'src' }) // proses semua html di src dan subfolder
    .pipe(fileInclude({
      prefix: '@@',
      basepath: 'src/'
    }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('dist'))
    .pipe(connect.reload());
}

function css() {
  return src('assets/compiled/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(concat('app.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/assets/css'))
    .pipe(connect.reload());
}

function js() {
  return src([
    'assets/compiled/js/*.js',
    'assets/static/js/**/*.js',
    'assets/extensions/**/*.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/assets/js'))
    .pipe(connect.reload());
}

function images() {
  return src([
    'assets/**/*.{png,jpg,jpeg,gif,svg,webp}',
  ], { base: 'assets' })
    .pipe(imagemin([
      mozjpeg({ quality: 75, progressive: true }),
      optipng({ optimizationLevel: 5 }),
      svgo({
        plugins: [
          'preset-default',
          {
            name: 'removeDimensions',
            active: true
          },
          {
            name: 'removeViewBox',
            active: false
          }
        ]
      })
    ]))
    .pipe(dest('dist/assets'))
    .pipe(connect.reload());
}

function server() {
  connect.server({
    root: 'dist',
    livereload: true,
    port: 3001
  });
}

function watcher() {
  watch('src/**/*.html', html); // Mengawasi semua perubahan di folder src/ untuk HTML
  watch('assets/compiled/css/*.css', css);
  watch('assets/**/*.js', js);
  watch('assets/**/*.{png,jpg,jpeg,gif,svg}', images);
}

function copyAssets() {
  return src([
    'assets/**/*',
    // Jangan exclude svg, kecuali memang sudah di-handle task images
    '!assets/**/*.{png,jpg,jpeg,gif,webp}', // exclude hanya gambar yang sudah dioptimasi
    '!assets/**/*.map'
  ], { base: 'assets' })
    .pipe(dest('dist/assets'))
    .pipe(connect.reload());
}

export default series(
  clean,
  parallel(html, css, js, images, copyAssets),
  parallel(server, watcher)
);

export function serveOnly() {
  server();
}
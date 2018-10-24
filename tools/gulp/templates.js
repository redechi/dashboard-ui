import gulp from 'gulp';
import nunjucks from 'gulp-nunjucks-render';
import htmlmin from 'gulp-htmlmin';
import data from 'gulp-data';
import sitemap from 'gulp-sitemap';
import plumber from 'gulp-plumber';
import gulpif from 'gulp-if';

import settings from '../../settings.js';

const TEMPLATES_GLOB = 'src/**/*.html';

const htmlminOptions = {
  removeComments: true,
  collapseWhitespace: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true
};

function buildNunjuckTemplates() {
  nunjucks.nunjucks.configure(['src/_templates/'], { watch: settings.DEV_HOT_RELOAD });
  return gulp.src(TEMPLATES_GLOB)
    .pipe(gulpif(settings.DEV_HOT_RELOAD, plumber()))
    .pipe(data(() => ({
      jsPaths: settings.DEV_HOT_RELOAD ? [
        `${settings.DEV_WEBPACK_BASE_URL}/modernizr-bundle.js`,
        `${settings.DEV_WEBPACK_BASE_URL}/vendors.js`,
        `${settings.DEV_WEBPACK_BASE_URL}/main.js`
      ] : [
        '/modernizr-bundle.js',
        '/vendors.js',
        '/main.js'
      ],
      cssPaths: settings.DEV_HOT_RELOAD ? [
        'https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css'
      ] : [
        'https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css',
        '/main.css'
      ]
    })))
      .pipe(nunjucks({
		  path: 'src/_templates/',
		  envOptions: {
		      watch: settings.DEV_HOT_RELOAD
		  }
	      }))
    .pipe(htmlmin(htmlminOptions))
    .pipe(gulp.dest('dist'));
}

function watchNunjuckTemplates() {
  return gulp.watch(TEMPLATES_GLOB, buildNunjuckTemplates);
}

const SITEMAP_GLOB = [
  'dist/**/*.html',
  '!dist/_templates/**/*.html'
];

function buildSitemap() {
  return gulp.src(SITEMAP_GLOB)
    .pipe(sitemap({
      siteUrl: settings.SITE_URL
    }))
    .pipe(gulp.dest('dist'));
}

gulp.task('templates:build', gulp.series(buildNunjuckTemplates, buildSitemap));
gulp.task('templates:watch', watchNunjuckTemplates);

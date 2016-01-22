import gulp from 'gulp';
import RevAll from 'gulp-rev-all';
import revNapkin from 'gulp-rev-napkin';

import settings from '../../settings.js';

function buildFingerprint() {
  const revAll = new RevAll({
    prefix: settings.SITE_BASE_PATH,
    dontRenameFile: [
      'favicon.ico',
      'sitemap.xml',
      '.html',
      '.txt',
      'main'
    ]
  });
  return gulp.src('dist/**')
    .pipe(revAll.revision())
    .pipe(gulp.dest('dist'))
    .pipe(revNapkin());
}

gulp.task('fingerprint:build', buildFingerprint);

import gulp from 'gulp';
import RevAll from 'gulp-rev-all';
import revNapkin from 'gulp-rev-napkin';

import settings from '../../settings.js';

function buildFingerprint() {
  return gulp.src('dist/**')
    .pipe(RevAll.revision(
			  {prefix: settings.SITE_BASE_PATH,
				  dontRenameFile: [
						   'favicon.ico',
						   'sitemap.xml',
						   '.html',
						   '.txt',
      'main'
						   ],
				  dontUpdateReference: [
      '.html'
    ]
				  }
))
    .pipe(gulp.dest('dist'))
    .pipe(revNapkin());
}

gulp.task('fingerprint:build', buildFingerprint);

import gulp from 'gulp';
import './tools/gulp/templates.js';
import './tools/gulp/static.js';
import './tools/gulp/images.js';
import './tools/gulp/fingerprint.js';
import './tools/gulp/social_links.js';
import './tools/gulp/deploy.js';

const BUILD_PIPELINE = [
  'templates:build',
  'static:build',
  'images:build',
  'fingerprint:build',
  'social_links:replace'
];

const WATCH_PIPELINE = [
  'templates:watch',
  'static:watch',
  'images:watch'
];

const DEPLOY_STAGING_PIPELINE = [
  'deploy:syncToAWS',
  'deploy:copyToBuildFolder'
];

const DEPLOY_PRODUCTION_PIPELINE = [
  'deploy:copyToAWS'
];

gulp.task('build', gulp.series(...BUILD_PIPELINE));
gulp.task('watch', gulp.series(...BUILD_PIPELINE, gulp.parallel(...WATCH_PIPELINE)));
gulp.task('deploy:staging', gulp.series(...DEPLOY_STAGING_PIPELINE));
gulp.task('deploy:production', gulp.series(...DEPLOY_PRODUCTION_PIPELINE));

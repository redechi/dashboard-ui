import { isEmpty } from 'lodash';
import gulp from 'gulp';
import awspublish from 'gulp-awspublish';
import merge from 'merge-stream';
import parallelize from 'concurrent-transform';

import settings from '../../settings.js';

function deployAWS() {
  if (isEmpty(settings.AWS_ACCESS_KEY_ID)) {
    throw new Error('Missing AWS_ACCESS_KEY_ID when attempting to deploy to AWS');
  }

  if (isEmpty(settings.AWS_SECRET_ACCESS_KEY)) {
    throw new Error('Missing AWS_SECRET_ACCESS_KEY when attempting to deploy to AWS');
  }

  if (isEmpty(settings.AWS_BUCKET)) {
    throw new Error('Missing AWS_BUCKET when attempting to deploy to AWS');
  }

  const publisher = awspublish.create({
    params: {
      Bucket: settings.AWS_BUCKET
    },
    accessKeyId: settings.AWS_ACCESS_KEY_ID,
    secretAccessKey: settings.AWS_SECRET_ACCESS_KEY
  });

  const headers = {
    'Cache-Control': 'max-age=10,public'
  };

  const gzip = gulp.src('./dist/**/data/*.*').pipe(awspublish.gzip());
  const plain = gulp.src(['./dist/**/*.*', '!./dist/**/data/*.*']);

  return merge(gzip, plain)
    .pipe(parallelize(publisher.publish(headers), 30))
    .pipe(awspublish.reporter());
}

function deploy() {
  let deployStream;
  switch (settings.DEPLOY_TARGET) {
    case 'aws':
      deployStream = deployAWS();
      break;
    default:
      throw new Error('Invalid deploy target');
  }

  return deployStream;
}

gulp.task('deploy:target', deploy);

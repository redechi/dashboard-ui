import { isEmpty } from 'lodash';
import gulp from 'gulp';
import awspublish from 'gulp-awspublish';
import merge from 'merge-stream';
import parallelize from 'concurrent-transform';
const exec = require('child_process').exec;

import settings from '../../settings.js';

function syncToAWS() {
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

function copyToAWS(cb) {
  /* jscs:disable maximumLineLength */
  /* eslint-disable max-len, no-shadow */
  exec('aws s3 cp "s3://$AWS_BUCKET_STAGE/$BUILD_ID" "s3://$AWS_BUCKET_PROD" --region="$AWS_REGION" --exclude "data/*" --recursive --metadata-directive REPLACE --cache-control "max-age=300"', (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    exec('aws s3 cp "s3://$AWS_BUCKET_STAGE/$BUILD_ID/data" "s3://$AWS_BUCKET_PROD/data" --region="$AWS_REGION" --recursive --metadata-directive REPLACE --content-encoding "gzip" --cache-control "max-age=300"', (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      cb();
    });
  });
  /* eslint-enable max-len, no-shadow */
  /* jscs:enable maximumLineLength */
}

function copyToBuildFolder(cb) {
  /* jscs:disable maximumLineLength */
  /* eslint-disable max-len */
  exec('aws s3 cp "s3://$AWS_BUCKET/" "s3://$AWS_BUCKET/$BUILD_ID" --region "$AWS_REGION" --recursive --exclude "[0123456789]*"', (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    cb();
  });
  /* eslint-enable max-len */
  /* jscs:enable maximumLineLength */
}

gulp.task('deploy:syncToAWS', syncToAWS);
gulp.task('deploy:copyToBuildFolder', copyToBuildFolder);
gulp.task('deploy:copyToAWS', copyToAWS);

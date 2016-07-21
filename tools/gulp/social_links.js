import gulp from 'gulp';
import replace from 'gulp-replace';

function socialLinks() {
  const siteUrl = 'https://dashboard.automatic.com';
  const fbSearchText = '<meta property="og:image" content="';
  const fbReplaceText = `${fbSearchText}${siteUrl}`;
  const twitterSearchText = '<meta name="twitter:image" content="';
  const twitterReplaceText = `${twitterSearchText}${siteUrl}`;
  return gulp.src('dist/labs/**')
    .pipe(replace(fbSearchText, fbReplaceText, { skipBinary: true }))
    .pipe(replace(twitterSearchText, twitterReplaceText, { skipBinary: true }))
    .pipe(gulp.dest('dist/labs'));
}

gulp.task('social_links:replace', socialLinks);

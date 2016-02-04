import { IS_LOCAL } from './config.js';

require('babel-polyfill');

import Raven from 'raven-js';
Raven
    .config('https://1e1818d9c5714d4990a766550ec593db@app.getsentry.com/33040', {
      whitelistUrls: ['dashboard.automatic.com/']
    })
    .install();

require('./_assets/scss/main.scss');

require('./_assets/jsx/app.jsx');

if (IS_LOCAL && module.hot) {
  module.hot.accept();
}

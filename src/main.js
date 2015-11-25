import { IS_LOCAL } from './config.js';

require('./_assets/scss/main.scss');

require('./_assets/jsx/app.jsx');

if (IS_LOCAL && module.hot) {
  module.hot.accept();
}

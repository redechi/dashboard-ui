import moment from 'moment';

export const IS_LOCAL = window.location.hostname === 'localhost';

//format for moment's calendar method
moment.locale('en', {
  calendar: {
    lastDay: '[Yesterday]',
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    lastWeek: 'MMM DD',
    nextWeek: 'MMM DD',
    sameElse: 'MMM DD'
  },
  week: {
    dow: 1
  }
});

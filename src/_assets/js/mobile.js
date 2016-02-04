import moment from 'moment';

exports.isAndroid = function isAndroid() {
  return /android/i.test(navigator.userAgent.toLowerCase());
};

exports.isIOS = function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
};

exports.isTablet = function isTablet() {
  return /ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(navigator.userAgent.toLowerCase());
};

exports.iOSAppCheck = function iOSAppCheck(e) {
  // wait a bit, if user doesn't have app ask if they would like to download it.
  document.location = e.target.href;
  const time = moment();
  setTimeout(() => {
    if (moment().diff(time) < 400) {
      /* eslint-disable no-alert */
      if (confirm('You do not seem to have Automatic installed. Would you like to download it from the app store?')) {
        document.location = 'https://itunes.apple.com/us/app/automatic/id596594365?mt=8';
      }
      /* eslint-enable no-alert */
    }
  }, 300);
};

exports.androidAppCheck = function androidAppCheck(e) {
  // from http://stackoverflow.com/
  // questions/7231085/how-to-fall-back-to-marketplace-when-android-custom-url-scheme-not-handled
  const custom = 'automatic://goto?id=insights_screen';
  const alt = 'http://play.google.com/store/apps/details?id=com.automatic';
  const gIntent = 'intent://scan/#Intent;scheme=automatic;package=com.automatic;end';
  let timer;
  let heartbeat;
  let iframeTimer;

  function clearTimers() {
    clearTimeout(timer);
    clearTimeout(heartbeat);
    clearTimeout(iframeTimer);
  }

  function intervalHeartbeat() {
    if (document.webkitHidden || document.hidden) {
      clearTimers();
    }
  }

  function tryIframeApproach() {
    const iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.onload = () => {
      document.location = alt;
    };

    iframe.src = custom;
    document.body.appendChild(iframe);
  }

  function tryWebkitApproach() {
    document.location = custom;
    timer = setTimeout(() => {
      document.location = alt;
    }, 2500);
  }

  function useIntent() {
    document.location = gIntent;
  }

  function launchAppOrAltUrl() {
    heartbeat = setInterval(intervalHeartbeat, 200);
    if (navigator.userAgent.match(/Chrome/)) {
      useIntent();
    } else if (navigator.userAgent.match(/Firefox/)) {
      tryWebkitApproach();
      iframeTimer = setTimeout(() => {
        tryIframeApproach();
      }, 1500);
    } else {
      tryIframeApproach();
    }
  }

  launchAppOrAltUrl();
  e.preventDefault();
};

import moment from 'moment';

exports.isAndroid = function() {
  return /Android/i.test(navigator.userAgent);
};

exports.isIOS = function() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

exports.iOSAppCheck = function(e) {
  //wait a bit, if user doesn't have app ask if they would like to download it.
  document.location = e.target.href;
  let time = moment();
  setTimeout(() => {
    if (moment().diff(time) < 400) {
      if (confirm('You do not seem to have Automatic installed. Would you like to download it from the app store?')) {
        document.location = 'https://itunes.apple.com/us/app/automatic/id596594365?mt=8';
      }
    }
  }, 300);
};

exports.androidAppCheck = function(e) {
  // jscs:disable maximumLineLength
  //from http://stackoverflow.com/questions/7231085/how-to-fall-back-to-marketplace-when-android-custom-url-scheme-not-handled
  // jscs:enable maximumLineLength
  let custom = 'automatic://goto?id=insights_screen';
  let alt = 'http://play.google.com/store/apps/details?id=com.automatic';
  let g_intent = 'intent://scan/#Intent;scheme=automatic;package=com.automatic;end';
  let timer;
  let heartbeat;
  let iframe_timer;

  function clearTimers() {
    clearTimeout(timer);
    clearTimeout(heartbeat);
    clearTimeout(iframe_timer);
  }

  function intervalHeartbeat() {
    if (document.webkitHidden || document.hidden) {
      clearTimers();
    }
  }

  function tryIframeApproach() {
    var iframe = document.createElement('iframe');
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
    document.location = g_intent;
  }

  function launch_app_or_alt_url() {
    heartbeat = setInterval(intervalHeartbeat, 200);
    if (navigator.userAgent.match(/Chrome/)) {
      useIntent();
    } else if (navigator.userAgent.match(/Firefox/)) {
      tryWebkitApproach();
      iframe_timer = setTimeout(() => {
        tryIframeApproach();
      }, 1500);
    } else {
      tryIframeApproach();
    }
  }

  launch_app_or_alt_url();
  e.preventDefault();
};

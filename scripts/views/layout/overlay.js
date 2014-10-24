
/*
 *
 * @type Constructor
 * @class Overlay
 *
 * NOTE :: There can only ever be one overlay.
 *
 * This is the Overlay Constructor function. Its a standard way of generating
 * an overlay with optionally an active or inactive masking layer. The overlay
 * only accets two types of objects
 *
 * 1) A type :: `{type: 'coachAccepted'}` :: this is the ID on a dom template
 * in templates/layout/overlay_tmpl.hbs
 * EX: new Overlay({type: 'coachOverlay'});
 *
 * 2) A View :: this is any existing or pre-exiting view.
 * EX: new Overlay(new CustomView());
 *
 * Events Triggered ::
 * `overlay:show` :: fired on a successful render.
 * `overlay:hide` :: fired onBeforeDistroy signals a successful distroy.
 *
 * Events Accepted ::
 * `overlay:destroy` :: distroys all visible overlays
 *
 */


define([
  'backbone',
  'communicator',
  'hbs!tmpl/layout/overlay_tmpl',
  '../../controllers/analytics'
],
function( Backbone, coms, OverlayTmpl, analytics ) {
  'use strict';

  var previousOverlay;

  return Backbone.Marionette.LayoutView.extend({

    template: OverlayTmpl,

    tagName: 'div',

    initialize: function() {
      this.$el.attr('id', 'overlay');
      this.render();

      coms.once('overlay:destroy', this.myDestroy, this);
      coms.on('overlay:page', this.updateLoadingOverlayCount, this);

      if(this.options.type === 'notSupported') {
        analytics.trackPageview('/unsupported');
      } else if(this.options.type === 'noTrips') {
        analytics.trackEvent('no trips overlay', 'Show');
      } else if(this.options.type === 'error403') {
        analytics.trackEvent('error403 overlay', 'Show');
      } else if(this.options.type === 'error500') {
        analytics.trackEvent('error500 overlay', 'Show');
      }
    },


    templateHelpers: function() {
      return {
        blobUrl: this.options.blobUrl,
        firstName: this.options.firstName,
        lastName: this.options.lastName
      };
    },


    className: function() {
      var classes = [];
      if(this.options.isiPhone) {
        classes.push('isiPhone');
      } else if(this.options.isAndroid) {
        classes.push('isAndroid');
      }
      return classes.join(' ');
    },


    events: {
      'click .close': 'triggerDestroy',
      'click .btn-close': 'triggerDestroy',
      'click .mask-close': 'triggerDestroy',
      'click a.iOSAppLink': 'iOSAppLink',
      'click a.androidAppLink': 'androidAppLink'
    },


    regions: {
      mainRegion: '#overlayContent',
      maskRegion: '#overlayMask'
    },


    updateLoadingOverlayCount: function(count) {
      $('.loadingProgress').text(count + ' trips loaded');
    },


    onRender: function () {
      var view = this.options.contentView;
      var type = this.options.type;

      var activeMask = (view && view.activeMask) ? true : this.options.activeMask;

      $('#overlayContent', this.$el).addClass(type);

      if (activeMask) {
        this.$el.find(this.regions.maskRegion).addClass('mask-close');
      }

      if (!view && !!type) {
        var template = this.$el.find('#'+type).text();
        var NewView = Backbone.Marionette.LayoutView.extend({template: template});
        this.mainRegion.show(new NewView());
      } else if (view) {
        this.mainRegion.show(view);
      } else {
        $('#overlayContent', this.$el).hide();
      }

      if (previousOverlay && previousOverlay.myDestroy) {
        previousOverlay.myDestroy();
      }

      $('body').append(this.$el);
      previousOverlay = this;
      coms.on('overlay:show', this);
    },


    onBeforeDestroy: function () {
      coms.trigger('overlay:hide', this);
    },


    triggerDestroy: function() {
      coms.trigger('overlay:destroy');
    },


    myDestroy: function () {
      this.destroy();
    },


    iOSAppLink: function(e) {
      //wait a bit, if user doesn't have app ask if they would like to download it.
      document.location = $(e.target).attr('href');
      var time = (new Date()).getTime();
      setTimeout(function(){
        var now = (new Date()).getTime();

        if((now - time) < 400) {
          if(confirm('You do not seem to have Automatic installed. Would you like to download it from the app store?')) {
            document.location = 'https://itunes.apple.com/us/app/automatic/id596594365?mt=8';
          }
        }
      }, 300);
    },


    androidAppLink: function(e) {
      //from http://stackoverflow.com/questions/7231085/how-to-fall-back-to-marketplace-when-android-custom-url-scheme-not-handled
      var custom = 'automatic://goto?id=insights_screen';
      var alt = 'http://play.google.com/store/apps/details?id=com.automatic';
      var g_intent = 'intent://scan/#Intent;scheme=automatic;package=com.automatic;end';
      var timer;
      var heartbeat;
      var iframe_timer;

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
        iframe.onload = function () {
          document.location = alt;
        };
        iframe.src = custom;
        document.body.appendChild(iframe);
      }

      function tryWebkitApproach() {
        document.location = custom;
        timer = setTimeout(function () {
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
          iframe_timer = setTimeout(function () {
            tryIframeApproach();
          }, 1500);
        } else {
          tryIframeApproach();
        }
      }

      launch_app_or_alt_url();
      e.preventDefault();
    }
  });
});

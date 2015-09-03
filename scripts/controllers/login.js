/*
 *
 * @type Constructor
 * @class Controller
 *
 *
 * This controller handles all login related tasks. Notable methods are
 *
 * this.login :: accepts or rejects user login.
 *
 * this.createUser :: creates a user and then sends that user to
 * the this.login method
 *
 */

define([
  'backbone',
  'communicator',
  '../views/layout/overlay',
  '../models/settings',
  './cache',
  './cookie',
  './analytics',
  'deparam'
],
function( Backbone, coms, OverlayLayout, settings, cache, cookie, analytics, deparam ) {
  'use strict';

  return {

    isLoggedIn: false,
    isDemo: settings.isDemo,
    isStaging: settings.isStaging,
    isUsingStaging: settings.isUsingStaging,


    login: function(model) {
      var self = this;
      var attributes = {
        username: model.get('username'),
        password: model.get('password'),
        client_id: model.get('client_id'),
        grant_type: model.get('grant_type'),
        scope: model.get('scope')
      };

      return $.post(
        model.url(),
        attributes,
        function (data) {
          if(data && data.access_token) {
            var expires = (model.get('staySignedIn')) ?  data.expires_in : undefined ;
            cookie.setCookie('accessToken', data.access_token, expires);
            analytics.trackEvent('login', 'Login');
            analytics.identifyUser(model.get('username'));
            cache.save('accessToken', data.access_token);

            Backbone.history.navigate('#/');
          }
        })
        .fail(this.error.bind(model));
    },


    logout: function() {
      sessionStorage.clear();
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },


    error: function (jqXHR){
      var error = (jqXHR.responseJSON && jqXHR.responseJSON.error) ? jqXHR.responseJSON.error : '';
      var message = '';

      if(jqXHR.status === 401 && error === 'invalid_credentials') {
        message = 'Invalid email or password';
      } else {
        message = 'Unknown error<br> If this persists please contact <a href="mailto:support@automatic.com">Support</a>.';
      }

      coms.trigger('login:error', message);
      this.trigger('invalid', message);
    },


    setAccessToken: function () {
      // get access token from URL parameter (for testing)
      var search = deparam(window.location.search.substring(1));

      // else get access token from cookie
      var accessToken = search.accessToken || cookie.getCookie('accessToken');

      //if non-matching token in sessionStorage, clear
      if(sessionStorage.getItem('accessToken') !== accessToken) {
        sessionStorage.clear();
      }

      if(accessToken) {
        this.isLoggedIn = true;

        //set access token in sessionStorage
        cache.save('accessToken', accessToken);

        //add beforeSend and complete to Backbone.sync
        var sync = Backbone.sync;
        Backbone.sync = function(method, model, options) {
          options = options || {};
          options.beforeSend = function (xhr, req) {
            try {
              //Set request header
              xhr.setRequestHeader('Authorization', 'bearer ' + accessToken);

              if(req.skipCache !== false) {
                return;
              }

              //check for cached response
              var cached = cache.fetch(req.url);
              if(cached) {
                this.success(JSON.parse(cached));
                xhr.abort('cached');
              }
            } catch (e) {
              console.warn('Request Not Cached: ' + req.url);
            }
          };

          options.complete = function(xhr, status) {

            // intentionally skip 500 its a legit server issue
            if (status > 500 && status < 600) {
              this.retryCount = this.retryCount || 0;
              this.retryMax = this.retryMax || 3;
              this.retryCount++;

              if (this.retryCount < this.retryMax) {
                return $.ajax(this);
              }
            }

            try {
              if(xhr.responseText !== '[]' && status !== 'error' && this.url.indexOf('/oauth/access_token') === -1 && this.url.indexOf('/trips') === -1) {
                cache.save(this.url, xhr.responseText);
              }
            } catch (e) {
              console.warn('Could Not Cache: ' + this.url);
            }
          };

          return sync(method, model, options);
        };
      }
    }
  };
});

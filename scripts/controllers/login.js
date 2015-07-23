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


    checkIfUserIsCoach: function() {
      if(cache.fetch('licenseplusSessionToken', true)) {
        this.getLicensePlusPrograms();
      } else {
        this.getLicensePlusGrantToken();
      }
    },


    getLicensePlusGrantToken: function() {
      var self = this;

      $.ajax({
        url: settings.get('base_host') + '/oauth/authorize/',
        type: 'POST',
        headers: {
          Accept: 'application/json'
        },
        datatype: 'json',
        data: {
          client_id: settings.get('licenseplus_client_id'),
          response_type: 'code',
          authorize: 'Authorize App',
          delegate_access_token: cache.fetch('accessToken', true),
          scope: 'scope:user:profile'
        },

        success: function(data) {
          console.log('Received Grant Token', data);
          if (data && data.grant_token) {
            self.getLicensePlusSessionID(data.grant_token);
          } else {
            console.error(new Error('Error Getting Grant Token'), data);
          }
        },

        error: function(jqxhr, textStatus, err) {
          console.error('Error Getting Grant Token', err);
        }
      });
    },


    getLicensePlusSessionID: function(grantToken) {
      var self = this;

      $.ajax({
        url: settings.get('licenseplus_host') + '/oauth/access_token/',
        type: 'POST',
        datatype: 'json',
        data: {
          code: grantToken
        },

        success: function(data) {
          console.log('Received LPlus Session ID', data);
          if (data && data.session_id) {
            cache.save('licenseplusSessionToken', data.session_id);

            self.getLicensePlusPrograms();
          } else {
            console.error('Unknown Error accessing Session ID');
          }
        },

        error: function(jqxhr, textStatus, err) {
          console.error('Error getting LPlus Session ID', err);
        }
      });
    },


    getLicensePlusPrograms: function() {
      var self = this;
      $.ajax({
        type: 'GET',
        url: settings.get('licenseplus_host') + '/user/me/',
        headers: {
          Authorization: 'LPlusSessionId ' + cache.fetch('licenseplusSessionToken', true)
        }
      }).done(function(data) {
        if(data && data.programs_as_coach && data.programs_as_coach.length) {
          cache.save('licensePlusProgram', data.programs_as_coach[0]);
          coms.trigger('user:change');
        }
      }).fail(function(jqXHR, textStatus, error) {
        console.error(error);
      });
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

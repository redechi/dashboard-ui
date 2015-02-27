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
  './analytics',
  '../models/settings',
  '../controllers/cache',
  '../controllers/cookie',
  'deparam'
],
function( Backbone, coms, analytics, settings, cache, cookie, deparam ) {
  'use strict';

  return {

    isLoggedIn: false,
    isDemo: settings.isDemo,
    isStaging: settings.isStaging,
    isUsingStaging: settings.isUsingStaging,


    login: function(model) {
      var self = this,
          isValid = model.isValid();

      // protect login
      if (!model.get('type') === 'login' || !isValid) {
        return isValid;
      }

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
            cookie.setCookie('token', data.access_token, expires);
            analytics.trackEvent('login', 'Login');
            analytics.identifyUser(model.get('username'));
            cache.save('accessToken', data.access_token);

            //if coming from coach_login, show licenseplus
            if(_.contains(['coach'], model.get('type'))) {
              $.ajax({
                type: 'POST',
                url: settings.get('newton_host') + '/internal/licenseplus/accept/',
                data: {
                  token: model.get('token')
                },
                headers: {
                  Authorization: 'bearer ' + data.access_token
                }
              }).done(function() {
                Backbone.history.navigate('#licenseplus?coachAccepted', {trigger: true});
              }).fail(function() {
                Backbone.history.navigate('#licenseplus', {trigger: true});
              })
            } else {
              Backbone.history.navigate('#/');
            }
          }
        })
        .fail(this.error.bind(model));
    },


    logout: function() {
      sessionStorage.clear();
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },


    createAccount: function(model) {
      var self = this,
          isValid = model.isValid();

      // protect createAccount
      if (!model.get('type') === 'createAccount' || !isValid) {
        return isValid;
      }

      var attributes = model.toJSON();

      delete attributes.type;
      delete attributes.token;
      delete attributes.scope;
      delete attributes.grant_type;
      delete attributes.staySignedIn;

      attributes.type = 'coach';
      attributes.source = 'DASHBOARD';
      attributes.device_identifier = Math.random().toString(36).substring(2,18);

      return $.ajax({
        url: model.url(),
        type: 'POST',
        data: attributes,
        headers: {
          Authorization: 'client ' + model.get('client_id')
        },
        datatype: 'json',
        success: function(data) {
          model.set('type', 'coach');
          self.login(model);
        },
        error: _.bind(this.error, model)
      });
    },


    error: function (jqXHR){
      var model = this,
          error = (jqXHR.responseJSON && jqXHR.responseJSON.error) ? jqXHR.responseJSON.error : '',
          message = '';

      if(jqXHR.status === 400 && jqXHR.responseText.indexOf('Invalid value') !== -1) {
        message = 'The coach invite URL was invalid.';
      } else if(jqXHR.status === 400 && error === 'err_incoming_relationship_already_exists') {
        message = 'You may only coach one student at a time, and you cannot be both a student and a coach.';
      } else if(jqXHR.status === 401 && error === 'invalid_credentials') {
        message = 'Invalid email or password';
      } else if(jqXHR.status === 409 || jqXHR.status === 422) {
        message = 'An account with that email already exists. Try logging in.';
      } else {
        message = 'Unknown error<br> If this persists please contact <a href="mailto:support@automatic.com">Support</a>.';
      }

      coms.trigger('login:error', message);
      model.trigger('invalid', message);
    },


    setAccessToken: function () {

      // get access token from URL parameter (for testing)
      var search = deparam(window.location.href);

      // else get access token from cookie
      var accessToken = search.accessToken || cookie.getCookie('token');

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
              if(req.url.indexOf('api.automatic') !== -1) {
                xhr.setRequestHeader('Authorization', 'bearer ' + accessToken);
              } else {
                xhr.setRequestHeader('Authorization', 'token ' + accessToken);
              }

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

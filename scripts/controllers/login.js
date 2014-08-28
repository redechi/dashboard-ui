define([
  'backbone',
  'communicator'
],
function( Backbone, coms ) {
  'use strict';

  return {

    isLoggedIn: false,


    isDemo: function () {
      return window.location.search.indexOf('demo') !== -1;
    },


    isStaging: function () {
      return window.location.hostname === 'dashboard.automatic.co';
    },


    isUsingStaging: function () {
      return window.location.search.indexOf('staging') !== -1;
    },


    getAPIUrl: function () {
      if(window.location.search.indexOf('staging') !== -1) {
        return 'https://api.automatic.co';
      } else {
        return 'https://api.automatic.com';
      }
    },


    getBaseUrl: function () {
      if(window.location.search.indexOf('staging') !== -1) {
        return 'https://staging.automatic.co';
      } else {
        return 'https://www.automatic.com';
      }
    },


    login: function () {
      // get access token from cookie
      var accessToken = this.getCookie('token');

      // if demo URL, use the demo token
      if(this.isDemo()) {
        var demoToken = 'e38f525a0795031c9a38b0c72a0e0f30bb7823a9';
        accessToken = demoToken;
      }

      //if non-matching token in sessionStorage, clear
      if(sessionStorage.getItem('accessToken') !== accessToken) {
        sessionStorage.clear();
      }

      if(accessToken) {
        this.isLoggedIn = true;

        //set access token in sessionStorage
        sessionStorage.setItem('accessToken', accessToken);

        //add beforeSend and complete to Backbone.sync
        var sync = Backbone.sync;
        Backbone.sync = function(method, model, options) {
          options.beforeSend = function (xhr, req) {
            try {
              //Set request header
              xhr.setRequestHeader('Authorization', 'token ' + accessToken);

              // TODO: invalidate cache at 15 min.
              var cached = sessionStorage.getItem(req.url);
              if(cached) {
                this.success(JSON.parse(cached));
                xhr.abort('cached');
              }
            } catch (e) {
              console.warn('Request Not Cached: ' + req.url);
            }
          };

          options.complete = function(xhr, status) {
            try {
              if(xhr.responseText !== '[]' && status !== 'error' && this.url.indexOf('/oauth/access_token') === -1 && this.url.indexOf('/trips') === -1) {
                sessionStorage.setItem(this.url, xhr.responseText);
              }
            } catch (e) {
              console.warn('Could Not Cache: ' + req.url);
            }
          };

          return sync(method, model, options);
        };
      }
    },


    getCookie: function(key) {
      return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
    },


    setCookie: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
      var sExpires = '';
      if (vEnd) {
        switch (vEnd.constructor) {
          case Number:
            sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
            break;
          case String:
            sExpires = '; expires=' + vEnd;
            break;
          case Date:
            sExpires = '; expires=' + vEnd.toUTCString();
            break;
        }
      }
      document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
      return true;
    },


    fetchErrorHandler: function(model, result) {
      if(result.status === 403) {
        coms.trigger('error:403');
      }
    }

  };
});

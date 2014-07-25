define([
  'backbone',
  'communicator'
],
function( Backbone, coms ) {
  'use strict';

  return {

    isLoggedIn: false,


    isPlayground: function () {
      return window.location.search.indexOf('playground') !== -1;
    },


    isStaging: function () {
      return window.location.hostname === 'dashboard.automatic.co';
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
      console.log('Do Login');

      // get access token from cookie
      var accessToken = this.getCookie('token');

      // if playground URL, use the dummy token
      if(this.isPlayground()) {
        var dummyToken = 'ba56eee32df6be1437768699247b406fc7d9992f';
        accessToken = dummyToken;
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
              if(xhr.responseText !== '[]' && status !== 'error' && this.url.indexOf('/oauth/access_token') === -1) {
                console.log('Caching Request: ' + this.url);
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

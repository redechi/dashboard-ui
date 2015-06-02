define([
  'backbone',
  'views/item/app',
  'hbs!tmpl/composite/apps_tmpl',
  'collections/apps'
],
function( Backbone, App, appTmpl, appsCollection ) {
  'use strict';

  return Backbone.Marionette.CompositeView.extend({

    initialize: function() {
      this.options.fetching = true;
      appsCollection.fetchInitial();
    },

    model: new Backbone.Model(),
    collection: appsCollection,
    childView: App,
    childViewContainer: '.appList',
    template: appTmpl,

    collectionEvents: {
      'reset': 'render'
    },

    onRender: function() {
      if(this.collection.length > 0 || this.options.fetching === false) {
        $('.loading', this.$el).hide();
      }

      if(this.collection.length === 0 && this.options.fetching === false) {
        $('.appList .noApps', this.$el).show();
      }

      this.options.fetching = false;
    }

  });

});

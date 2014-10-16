define([
  'backbone',
  'communicator',
  'regionManager',
  'hbs!tmpl/layout/licenseplus_tmpl',
  './overlay',
  '../item/single_badge',
  '../item/licenseplus_header',
  '../composite/licenseplus_trips',
  '../item/licenseplus_progress',
  '../item/header',
  '../../models/licenseplus',
  '../../controllers/login'
],

function( Backbone, coms, regionManager, LicenseplusTmpl, OverlayLayout, SingleBadgeView, LicenseplusHeaderView, LicenseplusTripsView, LicenseplusProgressView, HeaderView, Licenseplus, login ) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({

    initialize: function() {
      var self = this;
      coms.off('resize');
      coms.off('error:403');
      coms.off('error:500');
      coms.off('licenseplus:hideBadgeOverlay');
      coms.off('licenseplus:showBadgeOverlay');

      coms.on('resize', this.resize, this);
      coms.on('error:403', this.error403, this);

      coms.on('licenseplus:hideBadgeOverlay', this.hideBadgeOverlay, this);
      coms.on('licenseplus:showBadgeOverlay', this.showBadgeOverlay, this);

      this.selectors = {};

      this.model.fetch().done(function(){
        self.renderLicensePlus();
      });
    },


    template: LicenseplusTmpl,
    model: new Licenseplus(),


    regions: {
      header: '#licenseplusHeader',
      progress: '#leftColumn',
      trips: '#studentTrips',
      singleBadge: '#singleBadge'
    },


    className: 'licenseplus',


    onRender: function () {
      var student = this.model.get('student');

      regionManager.getRegion('main_header').show(new HeaderView({attributes: {
        loggedIn: login.isLoggedIn,
        licenseplusMenu: 'licenseplus'
      }}));

      if(student) {
        this.renderLicensePlus();
      }
    },


    renderLicensePlus: function() {
      var student = this.model.get('student');

      var t = new LicenseplusTripsView({attributes: {student_id: student.id}});
      var p = new LicenseplusProgressView({model: this.model});
      var h = new LicenseplusHeaderView({model: this.model});

      this.trips.show(t);
      this.progress.show(p);
      this.header.show(h);

      this.checkIfCoachAccepted();

      coms.trigger('resize');
    },


    onShow: function () {
      _.defer(function() {
        coms.trigger('resize')
      });
    },


    error403: function () {
      new OverlayLayout({type: 'error403'});
    },


    error500: function () {
      new OverlayLayout({type: 'error500'});
    },


    showBadgeOverlay: function(badge) {
      new OverlayLayout({contentView: new SingleBadgeView({model: badge}), type: 'singleBadge'});
    },


    hideBadgeOverlay: function () {
      this.singleBadge.reset();
    },


    checkIfCoachAccepted: function() {
      if(Backbone.history.getFragment().indexOf('?coachAccepted') > -1) {
        var student = this.model.get('student') || {};

        new OverlayLayout({
          type: 'coachAccepted',
          firstName: student.first_name,
          lastName: student.last_name
        });

        Backbone.history.navigate('#licenseplus');
      }
    },


    resize: function () {
      //Set all column heights equal
      var columns = [$('#progress', this.$el), $('#badges', this.$el), $('#studentTrips', this.$el)];
      var maxHeight = _.max(_.map(columns, function(column) {
        column.height('auto');
        return column.height();
      }));

      _.each(columns, function(column) {
        column.height(maxHeight);
      });
    }
  });
});

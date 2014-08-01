define([
  'backbone',
  'mapbox',
  '../../controllers/stats',
  'hbs!tmpl/item/map_single_tmpl',
  '../../collections/trips',
  '../../controllers/unit_formatters',
  '../../controllers/map_helpers'
],
function( Backbone, mapbox, stats, MapSingleTmpl, trips, formatters, mapHelpers ) {
  'use strict';

  return Backbone.Marionette.ItemView.extend({

    initialize: function() {
      console.log("initialize a Single Map ItemView");
    },

    collection: trips,

    template: MapSingleTmpl,

    templateHelpers: function() {
      var trip = this.collection.models[0];

      var helpers = {
        hard_brakes: trip.get('hard_brakes'),
        hard_accels: trip.get('hard_accels'),
        duration_over_70_min: Math.ceil(trip.get('duration_over_70_s') / 60)
      };

      if(trip.get('duration_over_70_s') === 0) {
        helpers.noSpeeding = true;
      }

      if(trip.get('hard_brakes') === 0) {
        helpers.noHardBrakes = true;
      }

      if(trip.get('hard_accels') === 0) {
        helpers.noHardAccels = true;
      }

      return helpers;
    },

    createMap: function() {
      _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
      };

      var mapbox = L.mapbox.map(this.$el.find('.map').get(0), 'automatic.idonii25'),
          featureLayer = L.mapbox.featureLayer(),
          hardBrakesLayer = this.hardBrakesLayer = L.mapbox.featureLayer(),
          hardAccelsLayer = this.hardAccelsLayer = L.mapbox.featureLayer(),
          speedingLayer = this.speedingLayer = L.mapbox.featureLayer(),
          geoJson = L.geoJson([], { style: mapHelpers.styleLine }),
          model = this.collection.models[0],
          startLoc = model.get('start_location'),
          endLoc = model.get('end_location'),
          path = model.get('path'),
          decodedPath,
          distances = [],
          popupTemplate = _.template('{{name}}<br>{{time}}');

      mapHelpers.enablePolyline();

      mapbox.addLayer(featureLayer);
      mapbox.addLayer(hardBrakesLayer);
      mapbox.addLayer(hardAccelsLayer);
      mapbox.addLayer(speedingLayer);

      if (path) {
        decodedPath = L.GeoJSON.decodeLine(path);
        geoJson.addData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: decodedPath
          }
        }).addTo(featureLayer);
        var cumulativeDistance = 0;
        distances = decodedPath.map(function(latlng, idx) {
          if(idx > 0) {
            var latlng2 = decodedPath[idx - 1];
            var distance = stats.calculateDistanceMi(latlng[0], latlng[1], latlng2[0], latlng2[1]);
            cumulativeDistance += distance;
          }
          return cumulativeDistance;
        });
      }

      if (startLoc) {
        featureLayer.addLayer(mapHelpers.createMarker('start', model, popupTemplate));
      }

      if (endLoc) {
        featureLayer.addLayer(mapHelpers.createMarker('end', model, popupTemplate));
      }

      model.get('drive_events').forEach(function(item) {
        if(item.type === 'hard_brake') {
          hardBrakesLayer.addLayer(L.marker([item.lat, item.lon], {icon: mapHelpers.hardBrakeIcon}));
        } else if(item.type === 'hard_accel') {
          hardAccelsLayer.addLayer(L.marker([item.lat, item.lon], {icon: mapHelpers.hardAccelIcon}));
        } else if(item.type === 'speeding' && distances.length) {
          var startDistanceMiles = formatters.m_to_mi(item.start_distance_m);
          var endDistanceMiles = formatters.m_to_mi(item.end_distance_m);
          var speedingPath = _.reduce(distances, function(memo, distance1, idx) {
            var distance2 = (idx < distances.length - 1) ? distances[idx + 1] : distance1;
            if(startDistanceMiles <= distance2 && endDistanceMiles >= distance1) {
              memo.push([decodedPath[idx][1], decodedPath[idx][0]]);
            }
            return memo;
          }, []);
          speedingLayer.addLayer(L.polyline(speedingPath, {color: '#fe8c0a', opacity: 1}));
        }
      });

      // weird timeout hack for mapbox
      setTimeout(function () {
        var bounds = featureLayer.getBounds();
        mapbox.invalidateSize();
        if(bounds.isValid()) {
          mapbox.fitBounds(bounds, {padding: [50, 50]});
        }
      }, 0);
    },


    onRender: function () {
      this.createMap();
    }

  });
});

/* eslint no-var:0, func-names:0, no-unused-vars:0, vars-on-top: 0, object-shorthand: 0 no-undef: 0, no-alert: 0 */
/* global _, $, moment, Slideout */

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

var viewserverAPI = 'https://view.automatic.com';
var recordsAPI = 'https://records-service-prod.herokuapp.com';
var accessToken = getAccessToken();

var dayTemplate = _.template($('#dayTemplate').html());
var photoTemplate = _.template($('#photoTemplate').html());
var vehicles;
var selectedVehicleId;

/* On Page Load */
$('#photoDate').datetimepicker({
  icons: {
    time: 'fa fa-clock-o',
    date: 'fa fa-calendar',
    up: 'fa fa-arrow-up',
    down: 'fa fa-arrow-down',
    next: 'fa fa-arrow-right',
    previous: 'fa fa-arrow-left'
  }
});

var slideout = new Slideout({
  panel: document.getElementById('panel'),
  menu: document.getElementById('menu'),
  padding: 256,
  tolerance: 70
});

function renderDay(day) {
  var encodedPolylines = _.compact(_.pluck(day.items[0].trips, 'path'));
  day.items[0].map_url = getStaticMap(encodedPolylines, { width: 678 });
  return $(dayTemplate(day));
}

function renderRecord(record) {
  if (!record.data || !record.data.type) {
    return null;
  }

  if (record.data.type === 'photo') {
    return $(photoTemplate(record));
  }
}

function sortItemsByDate(items) {
  return _.sortBy(items, function(item) {
    return -moment(item.datetime).valueOf();
  });
}

function setTitle(title) {
  $('.top-bar-title').text(title);
}

function renderActivity(items) {
  var divs = _.compact(sortItemsByDate(items).map(function(item) {
    if (item.type === 'record:day-group') {
      return renderDay(item);
    } else if (item.type === 'record:record') {
      return renderRecord(item);
    }
  }));

  if (!divs.length) {
    return $('#contentBox').append($('<div class="item nothing">Nothing found for this vehicle</div>'));
  }

  $('#contentBox').append(divs);
}

function fetchItems(vehicleId) {
  selectedVehicleId = vehicleId;
  var vehicle = _.findWhere(vehicles, { id: vehicleId });

  setTitle(vehicle.display_name);

  $('#contentBox').empty();

  function getDays(cb) {
    $.ajax({
      url: viewserverAPI + '/vehicle/' + vehicleId + '/timeline/',
      headers: {
        Authorization: 'bearer ' + accessToken
      }
    })
    .done(function(results) {
      var days = results.results.map(function(item) {
        return item;
      });
      cb(null, days);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error(errorThrown);
      cb(errorThrown);
    });
  }

  function getRecords(cb) {
    $.ajax({
      url: recordsAPI + '/timeline_event',
      headers: {
        Authorization: 'bearer ' + accessToken
      }
    })
    .done(function(results) {
      var records = _.where(results.results, { vehicle_id: vehicleId }).map(function(record) {
        record.type = 'record:record';
        record.datetime = record.created_at;
        return record;
      });
      cb(null, records);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error(errorThrown);
      cb(errorThrown);
    });
  }

  async.parallel([
    getDays,
    getRecords
  ], function(err, results) {
    if (err) {
      console.log(err);
      return alert('Unable to fetch results');
    }

    renderActivity(_.flatten(results, true));
  });
}

fetchVehicles(function(results) {
  vehicles = results;
  vehicles.forEach(function(vehicle) {
    $('.vehicle-select')
      .append($('<li>')
        .append($('<a>').attr('href', '#').data('vehicleId', vehicle.id).text(vehicle.display_name)));
  });

  fetchItems(_.first(vehicles).id);
});

$('.top-bar-icon').click(function() {
  slideout.toggle();
});

$('.slideout-menu').click(function() {
  slideout.close();
});

$('.vehicle-select').on('click', 'li a', function(e) {
  e.preventDefault();
  var vehicleId = $(e.target).data('vehicleId');
  fetchItems(vehicleId);
});

$('.add-photo').click(function() {
  $('.add-record-modal, .modal-overlay').fadeIn();
});

$('.modal .close').click(function() {
  $('.modal, .modal-overlay').fadeOut();
});

$('.btn-save').click(function(e) {
  e.preventDefault();

  var photoUrl = $('#photoUrl').val();
  var photoDescription = $('#photoDescription').val();
  var photoDate = $('#photoDate').data('DateTimePicker').date();

  if (!photoUrl) {
    return alert('Please enter a photo URL');
  }

  if (!photoDate) {
    return alert('Please enter a date and time for this photo');
  }

  var record = {
    vehicle_id: selectedVehicleId,
    created_at: photoDate.toISOString(),
    data: {
      photoDescription: photoDescription,
      photoUrl: photoUrl,
      type: 'photo'
    }
  };

  $.ajax({
    method: 'POST',
    url: recordsAPI + '/timeline_event',
    headers: {
      Authorization: 'bearer ' + accessToken
    },
    data: record,
    success: function(response) {
      $('.modal, .modal-overlay').fadeOut();
      fetchItems(selectedVehicleId);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error(errorThrown);
      $('.modal, .modal-overlay').fadeOut();
    }
  });
});

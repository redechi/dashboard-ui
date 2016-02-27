/* eslint no-var:0, func-names:0, no-unused-vars:0, vars-on-top: 0 */
/* eslint object-shorthand: 0 no-undef: 0, no-alert: 0, prefer-template: 0, prefer-arrow-callback: 0 */
/* global _, $, moment, Slideout */

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

var viewserverAPI = 'https://view.automatic.com';
var recordsAPI = 'https://records-service-prod.herokuapp.com';
var accessToken = getAccessToken();

var dayTemplate = _.template($('#dayTemplate').html());
var photoTemplate = _.template($('#photoTemplate').html());
var cardTemplate = _.template($('#cardTemplate').html());
var itemTemplate = _.template($('#itemTemplate').html());
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

  if (record.data.type === 'card') {
    return $(cardTemplate(record));
  }
}

function sortItemsByDate(items) {
  return _.sortBy(items, function(item) {
    return -moment(item.datetime).valueOf();
  });
}

function setTitle() {
  var vehicle = _.findWhere(vehicles, { id: selectedVehicleId });

  $('.top-bar-title').text(vehicle.display_name);
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

function fetchActivity() {
  $('#contentBox').empty();

  function getDays(cb) {
    $.ajax({
      url: viewserverAPI + '/vehicle/' + selectedVehicleId + '/timeline/',
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
      url: recordsAPI + '/viewserver/external_app_record/all',
      headers: {
        Authorization: 'bearer ' + accessToken
      }
    })
    .done(function(results) {
      var records = _.reduce(results.results, function(memo, record) {
        if (record.vehicle_id === selectedVehicleId || record.vehicle_id === 'all') {
          record.type = 'record:record';
          record.datetime = record.created_at;
          memo.push(record);
        }
        return memo;
      }, []);

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

function formatItem(item) {
  return _.extend({
    title: null,
    value: null,
    details: null,
    problem: null,
    image: null
  }, item);
}

function renderItems(items) {
  $('#contentBox').empty();

  var divs = items.map(function(item) {
    return $(itemTemplate(formatItem(item)));
  });

  _.defer(function() {
    $('#contentBox').append(divs);
  });
}

function fetchHealth() {
  var healthItems = [
    {
      type: 'fuel',
      title: 'Fuel',
      value: '30 miles remaining',
      details: '1.2 gallons',
      problem: true
    },
    {
      type: 'check-engine-light',
      title: 'Check Engine Light',
      value: 'No issues detected',
      details: 'Since ' + moment().format('MMM D, YYYY at h:mm a')
    },
    {
      type: 'recalls',
      title: 'Recalls',
      value: '2 recalls issued',
      details: 'Free repair available',
      problem: true
    },
    {
      type: 'battery',
      title: 'Battery',
      value: 'Healthy Battery',
      details: 'Voltage range normal'
    },
    {
      type: 'smog-check',
      title: 'Smog Check',
      value: 'Up-to-date',
      details: 'Next smog check due in 11 months'
    },
    {
      type: 'tires',
      title: 'Tires',
      value: 'Rotation due in 2 months',
      details: moment().add(2, 'months').format('MMM D, YYYY')
    },
    {
      type: 'oil',
      title: 'Oil',
      value: 'Oil change due in 1 week',
      details: moment().add(1, 'weeks').format('MMM D, YYYY')
    }
  ];

  renderItems(healthItems);
}

function fetchInsights() {
  var insightsItems = [
    {
      type: 'weekly-drive-score',
      title: 'Weekly Drive Score',
      image: 'img/insights/weekly-drive-score.png'
    },
    {
      type: 'commute-analyzer',
      title: 'Commute Analyzer',
      image: 'img/insights/commute-analyzer.png'
    },
    {
      type: 'car-comparison',
      title: 'Car Comparison',
      value: 'Top Pick: Mazda 6',
      details: 'The car with the lowest total cost of ownership in the same class as your Focus.'
    },
    {
      type: 'fuel-efficiency-trends',
      title: 'Fuel Efficiency Trends',
      value: '24.5 MPG',
      details: 'This week',
      image: 'img/insights/fuel-efficiency-trends.png'
    }
  ];

  renderItems(insightsItems);
}

function fetchGlovebox() {
  var gloveboxItems = [
    {
      type: 'insurance',
      title: 'Insurance',
      value: 'Policy Number',
      details: '23193871029U8'
    },
    {
      type: 'authorized-drivers',
      title: 'Authorized Drivers',
      value: '1 Authorized driver',
      details: 'John Smith'
    },
    {
      type: 'drivers-license',
      title: 'Driver\'s License',
      value: 'Add Your License',
      details: 'Scan your license for safe keeping and get reminders when to renew it.'
    },
    {
      type: 'manufacturer-information',
      title: 'Manufacturer Information',
      value: '2006 Ford Focus',
      details: '4-Door Hatchback'
    },
    {
      type: 'adapter',
      title: 'Adapter',
      value: '2nd Generation Adapter',
      details: 'Last connected: 5 hours ago'
    }
  ];

  renderItems(gloveboxItems);
}

fetchVehicles(function(results) {
  vehicles = _.sortBy(results, 'model');
  vehicles.forEach(function(vehicle) {
    $('.vehicle-menu')
      .append($('<li>')
        .append($('<a>').attr('href', '#').data('vehicleId', vehicle.id).text(vehicle.display_name)));
  });

  selectedVehicleId = _.first(vehicles).id;
  setTitle();
  fetchActivity();
});

$('.top-bar-icon').click(function() {
  slideout.toggle();
});

$('.slideout-menu').click(function() {
  slideout.close();
});

$('.vehicle-menu').on('click', 'li a', function(e) {
  e.preventDefault();
  selectedVehicleId = $(e.target).data('vehicleId');
  setTitle();
  fetchActivity();
});

$('.bottom-bar-item').click(function() {
  $(this).addClass('active')
    .siblings().removeClass('active');
  var option = $(this).data('option');

  if (option === 'activity') {
    fetchActivity();
  } else if (option === 'health') {
    fetchHealth();
  } else if (option === 'insights') {
    fetchInsights();
  } else if (option === 'glovebox') {
    fetchGlovebox();
  }
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

  // jscs:disable requirePaddingNewLinesAfterBlocks
  $.ajax({
    method: 'POST',
    url: recordsAPI + '/timeline_event',
    headers: {
      Authorization: 'bearer ' + accessToken
    },
    data: record,
    success: function(response) {
      $('.modal, .modal-overlay').fadeOut();
      fetchActivity();
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error(errorThrown);
      $('.modal, .modal-overlay').fadeOut();
    }
  });

  // jscs:enable requirePaddingNewLinesAfterBlocks
});

import _ from 'underscore';
import moment from 'moment';

const formatters = require('./formatters');

const filterList = [
  {
    key: 'vehicle',
    name: 'vehicle',
    label: 'Show trips from',
    defaultValue: 'all',
    valueText: (value) => {
      if(value === 'all') {
        return 'all my vehicles';
      } else if(value === 'other') {
        return 'other vehicle(s)';
      } else {
        // TODO: get vehicle name
        let vehicle = vehiclesCollection.get(this.get('value'));
        return (vehicle) ? vehicle.get('display_name') : 'Unknown';
      }
    }
  },
  {
    key: 'date',
    name: 'date of trip',
    label: 'driven',
    defaultValue: `${moment().endOf('day').subtract(29, 'days').startOf('day').valueOf()},${moment().endOf('day').valueOf()},last30Days`,
    valueText: (value) => {
      let [startDate, endDate, option] = value.split(',');
      let options = {
        thisWeek: 'this week',
        thisMonth: 'this month',
        last30Days: 'in the last 30 days',
        thisYear: 'this year',
        allTime: 'all time',
        custom: 'custom'
      };
      if(option === 'custom' || !option) {
        return formatters.dateRange(value);
      } else {
        return options[option];
      }
    }
  },
  {
    key: 'distance',
    name: 'distance traveled',
    label: 'and',
    defaultValue: '0,Infinity',
    valueText: (value) => {
      let [min, max] = value.split(',');
      if(parseInt(min, 10) === 0 && max === 'Infinity') {
        return 'all distances';
      } else {
        return `between ${min} - ${max} miles`;
      }
    }
  },
  {
    key: 'duration',
    name: 'duration of trip',
    label: 'and',
    defaultValue: '0,Infinity',
    valueText: (value) => {
      let [min, max] = value.split(',');
      if(parseInt(min, 10) === 0 && max === 'Infinity') {
        return 'all durations';
      } else {
        return `between ${min} - ${max} minutes`;
      }
    }
  },
  {
    key: 'cost',
    name: 'fuel cost',
    label: 'and',
    defaultValue: '0,Infinity',
    valueText: (value) => {
      let [min, max] = value.split(',');
      if(parseInt(min, 10) === 0 && max === 'Infinity') {
        return 'all costs';
      } else {
        return `between ${formatters.costWithUnit(min)} - ${ormatters.costWithUnit(max)}`;
      }
    }
  },
  {
    key: 'time',
    name: 'time of day',
    label: 'and',
    defaultValue: '0,Infinity',
    valueText: (value) => {
      let [min, max] = value.split(',');
      if(parseInt(min, 10) === 0 && parseInt(max, 10) === 24) {
        return 'all times of day';
      } else {
        let minValue = formatters.formatTime(moment(min, 'hours').valueOf(), null, 'h A');
        let maxValue = formatters.formatTime(moment(max, 'hours').valueOf(), null, 'h A')
        return `between ${minValue} - ${maxValue}`;
      }
    }
  },
  {
    key: 'businessTag',
    name: 'tagged as business trip',
    label: 'and',
    defaultValue: 'true',
    valueText: (value) => {
      return 'tagged as business trip';
    }
  }
];


exports.getFiltersFromQuery = function(query) {
  if(!query) {
    query = {};
  }

  let appliedFilters = {
    vehicle: query.vehicle || _.findWhere(filterList, {key: 'vehicle'}).defaultValue,
    date: query.date || _.findWhere(filterList, {key: 'date'}).defaultValue
  };

  if(query.distance) {
    appliedFilters.distance = query.distance;
  }
  if(query.duration) {
    appliedFilters.duration = query.duration;
  }
  if(query.cost) {
    appliedFilters.cost = query.cost;
  }
  if(query.time) {
    appliedFilters.time = query.time;
  }
  if(query.businessTag) {
    appliedFilters.businessTag = query.businessTag;
  }
  return appliedFilters;
};

exports.getFilter = function(filter) {
  return _.findWhere(filterList, {key: filter});
};

exports.getRemainingFilters = function(filters) {
  return _.reject(filterList, (filter) => !!filters[filter.key]);
}

exports.filterTrips = function(trips, filters) {
  let filteredTrips = trips;
  filteredTrips = filterByDate(filteredTrips, filters.date);
  filteredTrips = filterByVehicle(filteredTrips, filters.vehicle);
  if(filters.distance) {
    filteredTrips = filterByDistance(filteredTrips, filters.distance);
  }
  if(filters.duration) {
    filteredTrips = filterByDuration(filteredTrips, filters.duration);
  }
  if(filters.cost) {
    filteredTrips = filterByCost(filteredTrips, filters.cost);
  }
  if(filters.time) {
    filteredTrips = filterByTime(filteredTrips, filters.time);
  }
  if(filters.businessTag) {
    filteredTrips = filterByBusinessTag(filteredTrips, filters.businessTag);
  }

  return filteredTrips;
}

exports.getDateRange = function(filters) {
  let [startDate, endDate] = filters.date.split(',');
  return [parseInt(startDate, 10), parseInt(endDate, 10)];
}

function filterByDate(trips, dateFilter) {
  let [startDate, endDate] = dateFilter.split(',');
  let startIndex = findSortedIndexByDate(trips, parseInt(startDate, 10));
  let endIndex = findSortedIndexByDate(trips, parseInt(endDate, 10));
  return trips.slice(endIndex, startIndex);
}

function findSortedIndexByDate(trips, date) {
  let searchTrip = {started_at: date};
  //binary search since trips are already sorted by date
  return _.sortedIndex(trips, searchTrip, (trip) => {
    return -moment(trip.started_at).valueOf()
  });
}

function filterByVehicle(trips, vehicleFilter) {
  return _.filter(trips, (trip) => {
    if(vehicleFilter === 'all') {
      return true;
    } else if(vehicleFilter === 'other') {
      return (trip.vehicle === undefined);
    } else {
      return (vehicleFilter === trip.vehicle_id);
    }
  });
}

function filterByDistance(trips, distanceFilter) {
  let [minDistance, maxDistance] = distanceFilter.split(',');
  return _.filter(trips, (trip) => trip.distance_miles >= minDistance && trip.distance_miles <= maxDistance);
}

function filterByDuration(trips, durationFilter) {
  let [minDuration, maxDuration] = durationFilter.split(',');
  return _.filter(trips, (trip) => trip.duration_s >= minDuration && trip.duration_s <= maxDuration);
}

function filterByCost(trips, costFilter) {
  let [minCost, maxCost] = costFilter.split(',');
  return _.filter(trips, (trip) => trip.fuel_cost_usd >= minCost && trip.fuel_cost_usd <= maxCost);
}

function filterByTime(trips, timeFilter) {
  let [minHour, maxHour] = timeFilter.split(',');
  return _.filter(trips, (trip) => {
    return moment(trip.started_at).hour() >= minHour && moment(trip.ended_at).hour() <= maxHour;
  });
}

function filterByBusinessTag(trips, businessTagFilter) {
  return _.filter(trips, (trip) => _.contains(trip.tags, 'business'));
}

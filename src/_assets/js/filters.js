import _ from 'lodash';
import moment from 'moment';

const formatters = require('./formatters');

const endOfDay = moment().endOf('day').valueOf();
const thirtyDaysAgo = moment().endOf('day').subtract(29, 'days').startOf('day').valueOf();
const filterList = [
  {
    key: 'vehicle',
    name: 'vehicle',
    label: 'Show trips from',
    defaultValue: 'all',
    valueText: (value, vehicles) => {
      if (value === 'all') {
        return 'all my vehicles';
      } else if (value === 'other') {
        return 'other vehicle(s)';
      }

      return formatters.formatVehicle(_.find(vehicles, { id: value }));
    }
  },
  {
    key: 'date',
    name: 'date of trip',
    label: 'driven',
    defaultValue: `${thirtyDaysAgo},${endOfDay},last30Days`,
    valueText: (value) => {
      const [startDate, endDate, option] = value.split(',');
      const options = {
        thisWeek: 'this week',
        thisMonth: 'this month',
        last30Days: 'in the last 30 days',
        thisYear: 'this year',
        allTime: 'all time',
        custom: 'custom'
      };
      if (option === 'custom' || !option) {
        return formatters.dateRange([parseInt(startDate, 10), parseInt(endDate, 10)]);
      }

      return options[option];
    }
  },
  {
    key: 'distance',
    name: 'distance traveled',
    label: 'and',
    defaultValue: '0,Infinity',
    valueText: (value) => {
      const [min, max] = value.split(',');
      if (min === '0' && max === 'Infinity') {
        return 'all distances';
      }

      return `between ${min} - ${max} miles`;
    }
  },
  {
    key: 'duration',
    name: 'duration of trip',
    label: 'and',
    defaultValue: '0,Infinity',
    valueText: (value) => {
      const [min, max] = value.split(',');
      if (min === '0' && max === 'Infinity') {
        return 'all durations';
      }

      const formattedMin = Math.floor(moment.duration(parseInt(min, 10), 'seconds').asMinutes());
      const formattedMax = Math.ceil(moment.duration(parseInt(max, 10), 'second').asMinutes());
      return `between ${formattedMin} - ${formattedMax} minutes`;
    }
  },
  {
    key: 'cost',
    name: 'fuel cost',
    label: 'and',
    defaultValue: '0,Infinity',
    valueText: (value) => {
      const [min, max] = value.split(',');
      if (min === '0' && max === 'Infinity') {
        return 'all costs';
      }

      return `between ${formatters.costWithUnit(parseFloat(min))} - ${formatters.costWithUnit(parseFloat(max))}`;
    }
  },
  {
    key: 'time',
    name: 'time of day',
    label: 'and',
    defaultValue: '0,24',
    valueText: (value) => {
      const [min, max] = value.split(',');
      if (min === '0' && max === '24') {
        return 'all times of day';
      }

      const minValue = formatters.formatTime(moment(min, 'hours').valueOf(), null, 'h A');
      const maxValue = formatters.formatTime(moment(max, 'hours').valueOf(), null, 'h A');
      return `between ${minValue} - ${maxValue}`;
    }
  },
  {
    key: 'businessTag',
    name: 'tagged as business trip',
    label: 'and',
    defaultValue: 'true',
    valueText: () => {
      return 'tagged as business trip';
    }
  }
];

function findSortedIndexByDate(trips, date) {
  const searchTrip = { started_at: date };

  // binary search since trips are already sorted by date
  return _.sortedIndex(trips, searchTrip, (trip) => {
    return -moment(trip.started_at).valueOf();
  });
}

function filterByDate(trips, dateFilter) {
  const [startDate, endDate] = dateFilter.split(',');
  const startIndex = findSortedIndexByDate(trips, parseInt(startDate, 10));
  const endIndex = findSortedIndexByDate(trips, parseInt(endDate, 10));
  return trips.slice(endIndex, startIndex);
}

function filterByVehicle(trips, vehicleFilter) {
  return _.filter(trips, (trip) => {
    if (vehicleFilter === 'all') {
      return true;
    } else if (vehicleFilter === 'other') {
      return (trip.vehicle.id === null);
    }

    return (vehicleFilter === trip.vehicle.id);
  });
}

function filterByDistance(trips, distanceFilter) {
  const [minDistance, maxDistance] = distanceFilter.split(',');
  return _.filter(trips, (trip) => trip.distance_miles >= minDistance && trip.distance_miles <= maxDistance);
}

function filterByDuration(trips, durationFilter) {
  const [minDuration, maxDuration] = durationFilter.split(',');
  return _.filter(trips, (trip) => trip.duration_s >= minDuration && trip.duration_s <= maxDuration);
}

function filterByCost(trips, costFilter) {
  const [minCost, maxCost] = costFilter.split(',');
  return _.filter(trips, (trip) => trip.fuel_cost_usd >= minCost && trip.fuel_cost_usd <= maxCost);
}

function filterByTime(trips, timeFilter) {
  const [minHour, maxHour] = timeFilter.split(',');
  return _.filter(trips, (trip) => {
    return moment(trip.started_at).hour() >= minHour && moment(trip.ended_at).hour() <= maxHour;
  });
}

function filterByBusinessTag(trips) {
  return _.filter(trips, (trip) => _.contains(trip.tags, 'business'));
}

exports.getFiltersFromQuery = function getFiltersFromQuery(query) {
  if (!query) {
    query = {};
  }

  const appliedFilters = {
    vehicle: query.vehicle || _.findWhere(filterList, { key: 'vehicle' }).defaultValue,
    date: query.date || _.findWhere(filterList, { key: 'date' }).defaultValue
  };

  if (query.distance) {
    appliedFilters.distance = query.distance;
  }

  if (query.duration) {
    appliedFilters.duration = query.duration;
  }

  if (query.cost) {
    appliedFilters.cost = query.cost;
  }

  if (query.time) {
    appliedFilters.time = query.time;
  }

  if (query.businessTag) {
    appliedFilters.businessTag = query.businessTag;
  }

  return appliedFilters;
};

exports.getFilter = function getFilter(filter) {
  return _.findWhere(filterList, { key: filter });
};

exports.getRemainingFilters = function getRemainingFilters(filters) {
  return _.reject(filterList, (filter) => !!filters[filter.key]);
};

exports.filterTrips = function filterTrips(trips, filters) {
  let filteredTrips = trips || [];
  filteredTrips = filterByDate(filteredTrips, filters.date);
  filteredTrips = filterByVehicle(filteredTrips, filters.vehicle);
  if (filters.distance) {
    filteredTrips = filterByDistance(filteredTrips, filters.distance);
  }

  if (filters.duration) {
    filteredTrips = filterByDuration(filteredTrips, filters.duration);
  }

  if (filters.cost) {
    filteredTrips = filterByCost(filteredTrips, filters.cost);
  }

  if (filters.time) {
    filteredTrips = filterByTime(filteredTrips, filters.time);
  }

  if (filters.businessTag) {
    filteredTrips = filterByBusinessTag(filteredTrips, filters.businessTag);
  }

  return filteredTrips;
};

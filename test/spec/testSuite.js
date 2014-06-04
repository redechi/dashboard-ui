define(function() {
	'use strict';

	/* return an array of specs to be run */
	return {
		specs: ['spec/collections/trips.js',
		'spec/models/filter.js',
		'spec/models/trip.js',
		'spec/models/user.js',
		'spec/views/composite/filters.js',
		'spec/views/item/empty.js',
		'spec/views/item/filter.js',
		'spec/views/item/graph.js',
		'spec/views/item/map.js',
		'spec/views/item/trip.js',
		'spec/views/item/user_view.js',
		'spec/views/layout/summary.js',
		'spec/views/layout/trip.js'
		]
	};
});

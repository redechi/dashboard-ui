define(['handlebars'], function(Handlebars) {

this["JST"] = this["JST"] || {};

this["JST"]["templates/composite/filters_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h3 class=\"filterLabel\">Show Me</h3>\n\n<ul class=\"appliedFilters\"></ul>\n\n<div title=\"\" class=\"addFilter btn btn-filter btn-popover\" data-original-title=\"Add Filter\">\n  <i class=\"glyphicon glyphicon-plus\"></i>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"date\">\n  <select class=\"dateFilterValue\">\n    <option value=\"today\">Today</option>\n    <option value=\"thisWeek\">This Week</option>\n    <option value=\"thisMonth\">This Month</option>\n    <option value=\"lastMonth\">Last Month</option>\n    <option value=\"all\">All Time</option>\n  </select>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"vehicle\">\n  <select class=\"vehicleFilterValue\">\n    <option value=\"all\">All Vehicles</option>\n  </select>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"distance\">\n  <input class=\"distanceFilterValue slider\">\n  <div class=\"distanceFilterNotes\">\n    <div class=\"min\">Your shortest trip: <span></span> miles</div>\n    <div class=\"max\">Your longest trip: <span></span> miles</div>\n  </div>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"duration\">\n  <input class=\"durationFilterValue slider\">\n  <div class=\"durationFilterNotes\">\n    <div class=\"min\">Your shortest trip: <span></span> minutes</div>\n    <div class=\"max\">Your longest trip: <span></span> minutes</div>\n  </div>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"cost\">\n  <input class=\"costFilterValue slider\">\n  <div class=\"costFilterNotes\">\n    <div>Your trips have ranged between <span class=\"min\"></span> and <span class=\"max\"></span></div>\n  </div>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"location\">\n  <form class=\"locationFilterValue\">\n    <select class=\"locationFilterValueType\">\n      <option value=\"from\">From</option>\n      <option value=\"to\">To</option>\n    </select>\n    <input class=\"locationFilterValueAddress\" placeholder=\"Enter Address\">\n  </form>\n</div>\n";
  });

this["JST"]["templates/item/empty_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"trip\">\n  No Trips found.  Try <a href=\"#\" class=\"clearFilters\">clearing filters</a>.\n</div>\n";
  });

this["JST"]["templates/item/filters_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"btn btn-filter btn-popover\" data-filter=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n  <span class=\"btn-text\">";
  if (stack1 = helpers.valueText) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.valueText; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span><span class=\"caret\"></span>\n</div>\n";
  return buffer;
  });

this["JST"]["templates/item/graph_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"summaryStats\">\n  <div class=\"stat distance active\" data-graph-type=\"distance_miles\">\n    <div class=\"value\">";
  if (stack1 = helpers.distance) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.distance; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"label\">Miles</div>\n  </div>\n  <div class=\"stat duration\" data-graph-type=\"duration\">\n    <div class=\"value\">";
  if (stack1 = helpers.duration) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.duration; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"label\">Hours</div>\n  </div>\n  <div class=\"stat score\" data-graph-type=\"score\">\n    <div class=\"value\">";
  if (stack1 = helpers.score) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.score; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"label\">Score</div>\n  </div>\n  <div class=\"stat cost\" data-graph-type=\"fuel_cost_usd\">\n    <div class=\"value\">";
  if (stack1 = helpers.cost) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.cost; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"label\">Fuel</div>\n  </div>\n  <div class=\"stat mpg\" data-graph-type=\"average_mpg\">\n    <div class=\"value\">";
  if (stack1 = helpers.mpg) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.mpg; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"label\">MPG</div>\n  </div>\n</div>\n\n<svg height=\"225\"></svg>\n";
  return buffer;
  });

this["JST"]["templates/item/map_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"map\"></div>\n<div class=\"noMoveContainer\">\n  <label>\n    <input type=\"checkbox\" class=\"noMove\">\n    Don't move map\n  </label>\n</div>\n";
  });

this["JST"]["templates/item/trip_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<a href=\"#/trip/";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"trip\" data-trip_id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n  <div class=\"tripLine\">\n    <div>B</div>\n    <div>A</div>\n  </div>\n  <input type=\"checkbox\" class=\"tripCheck\">\n  <div class=\"tripDetails\">\n    <div class=\"topBox\">\n      <div class=\"endTime\">";
  if (stack1 = helpers.formatted_end_time) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.formatted_end_time; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n      <div class=\"endLocation\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.end_location),stack1 == null || stack1 === false ? stack1 : stack1.display_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</div>\n    </div>\n    <div class=\"middleBox\">\n      <div class=\"distance stat\">";
  if (stack2 = helpers.distance) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.distance; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</div>\n      <div class=\"mpg stat\">";
  if (stack2 = helpers.average_mpg) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.average_mpg; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</div>\n      <div class=\"fuelCost stat\">$";
  if (stack2 = helpers.fuel_cost_usd) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.fuel_cost_usd; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</div>\n      <div class=\"duration stat\">";
  if (stack2 = helpers.duration) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.duration; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</div>\n    </div>\n    <div class=\"bottomBox\">\n      <div class=\"startTime\">";
  if (stack2 = helpers.formatted_start_time) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.formatted_start_time; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</div>\n      <div class=\"startLocation\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.start_location),stack1 == null || stack1 === false ? stack1 : stack1.display_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</div>\n    </div>\n  </div>\n</a>\n";
  return buffer;
  });

this["JST"]["templates/item/trips_list_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"tripsHeader\">\n  <div class=\"tripCount\">";
  if (stack1 = helpers.total) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.total; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " TRIPS</div>\n  <div class=\"export\">\n    <label>Export</label>\n    <select id=\"exporter\">\n      <option></option>\n      <option value=\"all\">All</option>\n      <option value=\"selected\">Selected</option>\n    </select>\n  </div>\n</div>\n<ul class=\"trips\"></ul>\n";
  return buffer;
  });

this["JST"]["templates/layout/summary_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<header>\n  <div id=\"logo\"></div>\n  <div id=\"topMenu\"><a id=\"logout\" href=\"/logout/\">Log Out</a></div>\n</header>\n<div id=\"filters\"></div>\n<div id=\"left-column\">\n  <div id=\"trips\"></div>\n</div>\n<div id=\"right-column\">\n  <div id=\"graphs\"></div>\n  <div id=\"map\"></div>\n</div>\n";
  });

this["JST"]["templates/layout/trip_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  return buffer;
  });

return this["JST"];

});
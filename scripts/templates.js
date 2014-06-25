define(['handlebars'], function(Handlebars) {

this["JST"] = this["JST"] || {};

this["JST"]["templates/composite/filters_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<ul class=\"filterNav\">\n  <li class=\"undo btn-filter\"><a href=\"#\" title=\"Undo\">Undo</a></li><li class=\"redo btn-filter\"><a href=\"#\" title=\"Redo\">Redo</a></li>\n</ul>\n\n<ul class=\"appliedFilters\"></ul>\n\n<div class=\"filterLabel\">and</div>\n<div title=\"Add Filter\" class=\"addFilter btn-filter btn-popover\" data-original-title=\"Add Filter\"></div>\n\n<a href=\"#\" class=\"resetFilters\">Reset Filters</a>\n\n\n<div class=\"popoverContent\" data-filter=\"date\" title=\"Select Time Range\">\n  <select class=\"dateFilterValue\">\n    <option value=\"day\" data-offset=\"0\">Today</option>\n    <option value=\"week\" data-offset=\"0\">This Week</option>\n    <option value=\"month\" data-offset=\"0\">This Month</option>\n    <option value=\"month\" data-offset=\"-1\">Last Month</option>\n  </select>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"vehicle\" title=\"Select Vehicle\">\n  <select class=\"vehicleFilterValue\">\n    <option value=\"all\">All Vehicles</option>\n  </select>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"distance\" title=\"Choose Distance Range\">\n  <input class=\"distanceFilterValue slider\">\n  <div class=\"distanceFilterNotes\">\n    <div class=\"min\">Your shortest trip: <span></span> miles</div>\n    <div class=\"max\">Your longest trip: <span></span> miles</div>\n  </div>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"duration\" title=\"Choose Duration Range\">\n  <input class=\"durationFilterValue slider\">\n  <div class=\"durationFilterNotes\">\n    <div class=\"min\">Your shortest trip: <span></span> minutes</div>\n    <div class=\"max\">Your longest trip: <span></span> minutes</div>\n  </div>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"cost\" title=\"Choose Cost Range\">\n  <input class=\"costFilterValue slider\">\n  <div class=\"costFilterNotes\">\n    <div>Your trips have ranged between <span class=\"min\"></span> and <span class=\"max\"></span></div>\n  </div>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"location\" title=\"Choose Location\">\n  <form class=\"locationFilterValue\">\n    <select class=\"locationFilterValueType\">\n      <option value=\"start\">From</option>\n      <option value=\"end\">To</option>\n    </select>\n    <input class=\"locationFilterValueAddress\" placeholder=\"Enter Address\">\n  </form>\n  <div class=\"locationFilterResults\"></div>\n</div>\n\n<div class=\"popoverContent\" data-filter=\"time\">\n  <input class=timeFilterValue slider\">\n</div>\n";
  });

this["JST"]["templates/composite/trips_list_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"tripsHeader\">\n  <div class=\"tripCount\">";
  if (stack1 = helpers.total) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.total; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " Trips</div>\n\n  <select class=\"sortType\">\n    <option value=\"start_time\">Time/Date</option>\n    <option value=\"distance_m\">Distance</option>\n    <option value=\"average_mpg\">MPG</option>\n    <option value=\"fuel_cost_usd\">Cost</option>\n    <option value=\"duration\">Duration</option>\n    <option value=\"score\">Score</option>\n  </select>\n</div>\n\n<ul class=\"trips\"></ul>\n\n<div id=\"tripsFooter\">\n  <div class=\"btn-export btn-popover\">Export</div>\n</div>\n";
  return buffer;
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


  buffer += "<div class=\"filterLabel\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n<div class=\"btn-filter btn-popover btn-dropdown\" data-filter=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n  <span class=\"btn-text\">";
  if (stack1 = helpers.valueText) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.valueText; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n</div>\n";
  return buffer;
  });

this["JST"]["templates/item/graph_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<!-- \n\n-->\n<div class=\"grapModifiers\">\n  <div class=\"dateRange\">Date Range</div>\n\n  <select class=\"durationType\">\n    <option value=\"average_mpg\">By Day</option>\n    <option value=\"fuel_cost_usd\">By Week</option>\n    <option value=\"score\">By Month</option>\n  </select>\n\n  <div>\n    <input id=\"otherDrivers\" type=\"checkbox\">\n    <label for=\"otherDrivers\">Other Automatic Drivers</label>\n  </div>\n\n  <select class=\"graphType\">\n    <option value=\"average_mpg\">By MPG</option>\n    <option value=\"fuel_cost_usd\">By Cost</option>\n    <option value=\"score\">By Score</option>\n    <option value=\"distance_miles\">By Distance</option>\n    <option value=\"duration\">By Duration</option>\n  </select>\n</div>\n\n<svg height=\"225\"></svg>\n\n<div class=\"prevDates\" title=\"Prev Dates\"><i class=\"glyphicon glyphicon-chevron-left\"></i></div>\n\n<div class=\"nextDates\" title=\"Next Dates\"><i class=\"glyphicon glyphicon-chevron-right\"></i></div>\n";
  });

this["JST"]["templates/item/map_single_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "noHardBrakes";
  }

function program3(depth0,data) {
  
  
  return "noHardAccels";
  }

function program5(depth0,data) {
  
  
  return "noSpeeding";
  }

  buffer += "<div class=\"map\"></div>\n<div class=\"tripEvents\">\n  <div class=\"hardBrakes event ";
  stack1 = helpers['if'].call(depth0, depth0.noHardBrakes, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n    <span>";
  if (stack1 = helpers.hard_brakes) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.hard_brakes; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n    <label>Hard Brakes</label>\n  </div>\n  <div class=\"hardAccels event ";
  stack1 = helpers['if'].call(depth0, depth0.noHardAccels, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n    <span>";
  if (stack1 = helpers.hard_accels) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.hard_accels; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n    <label>Hard Accels</label>\n  </div>\n  <div class=\"speeding event ";
  stack1 = helpers['if'].call(depth0, depth0.noSpeeding, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n    <span>";
  if (stack1 = helpers.duration_over_70_min) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.duration_over_70_min; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n    <label>Min over 70</label>\n  </div>\n</div>\n";
  return buffer;
  });

this["JST"]["templates/item/map_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"map\"></div>\n";
  });

this["JST"]["templates/item/trip_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "noHardBrakes";
  }

function program3(depth0,data) {
  
  
  return "noHardAccels";
  }

function program5(depth0,data) {
  
  
  return "noSpeeding";
  }

  buffer += "<a href=\"#/trip/";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"trip\" data-trip_id=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n  \n  <div class=\"timeTopBox\">\n    <div class=\"endTime\">";
  if (stack1 = helpers.formatted_end_time) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.formatted_end_time; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"endTime\">";
  if (stack1 = helpers.formatted_calendar_date) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.formatted_calendar_date; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n  </div>\n\n\n  <div class=\"timeBottomBox\">\n    <div class=\"startTime\">";
  if (stack1 = helpers.formatted_start_time) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.formatted_start_time; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n  </div>\n\n\n\n  <div class=\"tripLine\">\n    <div>B</div>\n    <div>A</div>\n  </div>\n\n\n\n  <div class=\"tripDetails\">\n\n    <div class=\"bottomBox\">\n      <div class=\"startLocation\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.start_location),stack1 == null || stack1 === false ? stack1 : stack1.display_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</div>\n    </div>\n\n    <div class=\"middleBox\">\n      <div class=\"distance stat\">";
  if (stack2 = helpers.distance) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.distance; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</div>\n      <div class=\"mpg stat\">";
  if (stack2 = helpers.average_mpg) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.average_mpg; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</div>\n      <div class=\"fuelCost stat\">";
  if (stack2 = helpers.fuel_cost_usd) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.fuel_cost_usd; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</div>\n      <div class=\"duration stat\">";
  if (stack2 = helpers.duration) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.duration; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</div>\n    </div>\n    <div class=\"tripEventsBox\">\n      <div class=\"hardBrakes event octagon ";
  stack2 = helpers['if'].call(depth0, depth0.noHardBrakes, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">";
  if (stack2 = helpers.hard_brakes) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.hard_brakes; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "<i class=\"glyphicon glyphicon-ok\"></i></div>\n      <div class=\"hardAccels event ";
  stack2 = helpers['if'].call(depth0, depth0.noHardAccels, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">";
  if (stack2 = helpers.hard_accels) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.hard_accels; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "<i class=\"glyphicon glyphicon-ok\"></i></div>\n      <div class=\"speeding event ";
  stack2 = helpers['if'].call(depth0, depth0.noSpeeding, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">";
  if (stack2 = helpers.duration_over_70_min) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.duration_over_70_min; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</div>\n    </div>\n\n    <div class=\"topBox\">\n      <div class=\"endLocation\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.end_location),stack1 == null || stack1 === false ? stack1 : stack1.display_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</div>\n    </div>\n\n  </div>\n</a>\n";
  return buffer;
  });

this["JST"]["templates/item/user_score_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"summaryStats\">\n  <svg data-score=\"";
  if (stack1 = helpers.score) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.score; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"></svg>\n  <div class=\"stat distance\">\n    <div class=\"value\">";
  if (stack1 = helpers.distance) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.distance; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"label\">Miles</div>\n  </div>\n  <div class=\"stat mpg active\">\n    <div class=\"value\">";
  if (stack1 = helpers.mpg) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.mpg; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"label\">MPG</div>\n  </div>\n  <div class=\"stat cost\">\n    <div class=\"value\">";
  if (stack1 = helpers.cost) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.cost; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"label\">Fuel</div>\n  </div>\n  <div class=\"stat duration\">\n    <div class=\"value\">";
  if (stack1 = helpers.duration) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.duration; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"label\">Hours</div>\n  </div>\n</div>\n";
  return buffer;
  });

this["JST"]["templates/item/user_view_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<ul>\n  <li>\n    <a href=\"http://blog.automatic.com\">Blog</a>\n  </li>\n  <li>\n    <a href=\"https://www.automatic.com/support/\">Support</a>\n  </li>\n  <li>\n    <span class=\"firstName\">";
  if (stack1 = helpers.first_name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.first_name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n    <a href=\"/#/logout\">Log Out</a>\n  </li>\n</ul>\n";
  return buffer;
  });

this["JST"]["templates/layout/summary_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"filters\"></div>\n<div id=\"right-column\">\n  <div id=\"trips\"></div>\n</div>\n<div id=\"left-column\">\n  <div id=\"graphs\"></div>\n  <div id=\"map\"></div>\n</div>\n";
  });

this["JST"]["templates/layout/trip_list_layout_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"aggStats\"></div>\n<div id=\"tripList\"></div>\n";
  });

this["JST"]["templates/layout/trip_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "noTrip";
  }

  buffer += "<div id=\"trip\">\n  <div class=\"tripHeader\">\n    <a href=\"#/\" class=\"back btn btn-default\">\n      <span class=\"glyphicon glyphicon-chevron-left\"></span> Back\n    </a>\n    <a href=\"#/trip/";
  if (stack1 = helpers.prevTrip) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.prevTrip; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"btn btn-default previousTrip ";
  stack1 = helpers.unless.call(depth0, depth0.prevTrip, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n      <span class=\"glyphicon glyphicon-chevron-left\"></span>\n    </a>\n    <span class=\"title\">";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n    <a href=\"#/trip/";
  if (stack1 = helpers.nextTrip) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.nextTrip; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"btn btn-default nextTrip ";
  stack1 = helpers.unless.call(depth0, depth0.nextTrip, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n      <span class=\"glyphicon glyphicon-chevron-right\"></span>\n    </a>\n    <!--<a href=\"#\" class=\"share btn btn-default\" data-toggle=\"popover\">\n      <span class=\"glyphicon glyphicon-share\"></span> Share\n    </a>-->\n  </div>\n  <div class=\"summaryStats\">\n    <div class=\"stat mpg\" data-graph-type=\"average_mpg\">\n      <div class=\"value\">";
  if (stack1 = helpers.mpg) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.mpg; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n      <div class=\"label\">MPG</div>\n    </div>\n    <div class=\"stat cost\" data-graph-type=\"fuel_cost_usd\">\n      <div class=\"value\">";
  if (stack1 = helpers.cost) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.cost; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n      <div class=\"label\">Fuel</div>\n    </div>\n    <div class=\"stat score\" data-graph-type=\"score\">\n      <div class=\"value\">";
  if (stack1 = helpers.score) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.score; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n      <div class=\"label\">Score</div>\n    </div>\n    <div class=\"stat distance\" data-graph-type=\"distance_miles\">\n      <div class=\"value\">";
  if (stack1 = helpers.distance) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.distance; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n      <div class=\"label\">Miles</div>\n    </div>\n    <div class=\"stat duration\" data-graph-type=\"duration\">\n      <div class=\"value\">";
  if (stack1 = helpers.duration) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.duration; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n      <div class=\"label\">Time</div>\n    </div>\n  </div>\n  <div id=\"map\"></div>\n\n</div>\n";
  return buffer;
  });

return this["JST"];

});
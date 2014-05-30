define(['handlebars'], function(Handlebars) {

this["JST"] = this["JST"] || {};

this["JST"]["templates/composite/filters_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"filters\">\n  <h3 class=\"filterLabel\">Show Me</h3>\n  <div class=\"appliedFilters\">\n\n    <div title=\"\" data-filter=\"date\" class=\"dateFilter btn btn-filter btn-popover applied\" data-original-title=\"Select Time Range\">\n      <span class=\"btn-text\">All time</span><span class=\"caret\"></span>\n      <span class=\"popover-text\">\n        <select class=\"dateFilterValue\">\n          <option value=\"today\">Today</option>\n          <option value=\"thisWeek\">This week</option>\n          <option value=\"thisMonth\">This month</option>\n          <option value=\"lastMonth\">Last month</option>\n          <option value=\"all\" selected=\"selected\">All time</option>\n        </select>\n      </span>\n    </div>\n\n    <div title=\"\" data-filter=\"duration\" class=\"durationFilter btn btn-filter btn-popover\" data-original-title=\"Select Trip Duration\">\n      <span class=\"btn-text\">All Durations</span><span class=\"caret\"></span>\n      <span class=\"popover-text\">\n        <input class=\"durationFilterValue slider\">\n        <div class=\"durationFilterNotes\">\n        <div class=\"min\">Your shortest trip: <span>1</span> minutes</div>\n        <div class=\"max\">Your longest trip: <span>20</span> minutes</div>\n        </div>\n      </span>\n    </div>\n\n    <div title=\"\" data-filter=\"cost\" class=\"costFilter btn btn-filter btn-popover\" data-original-title=\"Select Fuel Cost\">\n      <span class=\"btn-text\">All Costs</span><span class=\"caret\"></span>\n      <span class=\"popover-text\">\n        <input class=\"costFilterValue slider\">\n        <div class=\"costFilterNotes\">\n          <div>Your trips have ranged between <span class=\"min\">$0.02</span> and <span class=\"max\">$0.82</span>.</div>\n        </div>\n      </span>\n    </div>\n\n    <div title=\"\" data-filter=\"location\" class=\"locationFilter btn btn-filter btn-popover\" data-original-title=\"Set Location Filter\">\n      <span class=\"btn-text\">Everywhere</span><span class=\"caret\"></span>\n      <span class=\"popover-text\"><span>All</span></span>\n    </div>\n\n  </div>\n\n  <ul></ul>\n\n  <div title=\"\" class=\"addFilter btn btn-default btn-popover\" data-original-title=\"Add Filter\">\n    <i class=\"glyphicon glyphicon-plus\"></i>\n  </div>\n</div>\n\n\n";
  });

this["JST"]["templates/item/empty_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"trip\">\n  Loading...\n</div>\n\n";
  });

this["JST"]["templates/item/filters_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"applied-filter\">";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " | <span class=\"remove-filter\">x</span></div>\n";
  return buffer;
  });

this["JST"]["templates/item/graph_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<!-- empty graph template -->\n";
  });

this["JST"]["templates/item/map_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<!-- empty map template -->\n";
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
  if (stack2 = helpers.distance_miles) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.distance_miles; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
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

return this["JST"];

});
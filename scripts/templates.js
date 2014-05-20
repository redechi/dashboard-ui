define(['handlebars'], function(Handlebars) {

this["JST"] = this["JST"] || {};

this["JST"]["templates/item/empty_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"trip\">\n  Loading...\n</div>\n\n";
  });

this["JST"]["templates/item/graph_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div>\n  I'm where the graph goes but heres some aggregate data.<br>\n  <h1>Total distance: ";
  if (stack1 = helpers.distance) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.distance; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " m.</h1>\n</div>\n";
  return buffer;
  });

this["JST"]["templates/item/map_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div>im where the map goes</div>\n";
  });

this["JST"]["templates/item/trip_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"trip\">\n  <div>Cost: $";
  if (stack1 = helpers.fuel_cost_usd) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.fuel_cost_usd; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n  <div>Average MPG: ";
  if (stack1 = helpers.average_mpg) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.average_mpg; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n</div>\n";
  return buffer;
  });

this["JST"]["templates/layout/summary_tmpl.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"map\">map div</div>\n<div id=\"graph\">graph div</div>\n<div id=\"trips\">trips div</div>\n";
  });

return this["JST"];

});
(function() {

  // ----------
  var component = App.CanvasBase = function() {
  };

  // ----------
  component.prototype = {
    // ----------
    _initCanvas: function($canvas) {
      this.$canvas = $canvas;
      this._context = this.$canvas[0].getContext('2d');
      this._width = this.$canvas.width();
      this._height = this.$canvas.height();

      this.$canvas.prop({
        width: this._width,
        height: this._height
      });
    }
  };

})();

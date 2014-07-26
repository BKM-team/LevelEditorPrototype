$(document).ready(function () {

  var EditorElement = function (imageSrc) {
    this._sprite = new createjs.Bitmap(imageSrc);

    this._sprite.on('mousedown', EditorElement._mouseDownHandler.bind(this));
    this._sprite.on('pressmove', EditorElement._mouseMoveHandler.bind(this));
    this._sprite.cursor = 'pointer';

    Object.defineProperty(this, 'x', EditorElement._xGetSet);
    Object.defineProperty(this, 'y', EditorElement._yGetSet);

    stage.addChild(this._sprite);
  };

  EditorElement._xGetSet = {
    get: function () {
      return this._sprite.x;
    },
    set: function (val) {
      this._sprite.x = val;
    }
  };

  EditorElement._yGetSet = {
    get: function () {
      return this._sprite.y;
    },
    set: function (val) {
      this._sprite.y = val;
    }
  };

  EditorElement._mouseDownHandler = function (evt) {
    this._sprite.offset = {
      x: this.x - evt.stageX,
      y: this.y - evt.stageY
    };
  };

  EditorElement._mouseMoveHandler = function (evt) {
    this.x = evt.stageX + this._sprite.offset.x;
    this.y = evt.stageY + this._sprite.offset.y;
  };

  EditorElement.prototype.setPosition = function (position) {
    this.x = position.x;
    this.y = position.y;
  }

  $('li').draggable({
    helper: function () {
      var $img = $(this).find('img');
      var originalImage = $('<img />', {
        src: $img.data().original,
        'class': 'drag-helper'
      });

      return originalImage;
    }
  });

  $.fn.posRelativeTo = function (element) {
    var thisOffset = this.offset();
    var elementOffset = element.offset();
    var dx = thisOffset.left - elementOffset.left;
    var dy = thisOffset.top - elementOffset.top;
    return {
      top: dy,
      left: dx
    };
  };

  $('canvas').droppable({
    tolerance: 'fit',
    drop: function (event, ui) {
      var element = new EditorElement(ui.helper.eq(0).attr('src'));
      var position = ui.helper.posRelativeTo($('canvas'));

      element.setPosition({
        x: position.left,
        y: position.top
      });

      ui.helper.remove();
    }
  });

  $('canvas').attr('width', $('.right-panel').width())
    .attr('height', $('.right-panel').height());

  var stage = new createjs.Stage('stage');
  stage.enableMouseOver(10);

  createjs.Ticker.on('tick', function () {
    stage.update();
  });
  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
  createjs.Ticker.setFPS(60);
});
'use strict';

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

var EditorElement = function (imageSrc, parentStage) {
  this._sprite = new createjs.Bitmap(imageSrc);

  this._sprite.on('mousedown', EditorElement._mouseDownHandler.bind(this));
  this._sprite.on('pressup', EditorElement._mouseUpHandler.bind(this));
  this._sprite.on('pressmove', EditorElement._mouseMoveHandler.bind(this));
  this._sprite.cursor = 'pointer';

  this._parentStage = parentStage;

  Object.defineProperty(this, 'x', EditorElement._xGetSet);
  Object.defineProperty(this, 'y', EditorElement._yGetSet);
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
  this._dragStartZIndex = this._parentStage.getChildIndex(this);
  this._parentStage.moveChildToTop(this);
  this._dragStartPosition = {
    x: this.x - evt.stageX,
    y: this.y - evt.stageY
  };
};

EditorElement._mouseMoveHandler = function (evt) {
  this.x = evt.stageX + this._dragStartPosition.x;
  this.y = evt.stageY + this._dragStartPosition.y;
};

EditorElement._mouseUpHandler = function () {
  this._parentStage.setChildIndex(this, this._dragStartZIndex);
};

EditorElement.prototype.setPosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

EditorElement.prototype.getSprite = function () {
  return this._sprite;
};

var Stage = function ($canvas) {
  this._canvas = $canvas;
  this._stage = new createjs.Stage(this._canvas.attr('id'));
  this._stage.enableMouseOver(10);
};

Stage.prototype.updateSize = function () {
  var $canvasParent = this._canvas.parent();
  this._canvas.attr('width', $canvasParent.width());
  this._canvas.attr('height', $canvasParent.height());
};

Stage.prototype.installEvents = function () {
  this._canvas.droppable({
    tolerance: 'fit',
    drop: (function (event, ui) {
      var element = new EditorElement(ui.helper.eq(0).attr('src'), this);
      this.addChild(element);
      var position = ui.helper.posRelativeTo(this._canvas);

      element.setPosition({
        x: position.left,
        y: position.top
      });

      ui.helper.remove();
    }).bind(this)
  });

  createjs.Ticker.on('tick', Stage._tickHandler.bind(this));
  $(window).on('resize', Stage._resizeHandler.bind(this));
};

Stage.prototype.addChild = function (child) {
  this._stage.addChild(child.getSprite());
};

Stage.prototype.moveChildToTop = function (child) {
  this._stage.setChildIndex(child.getSprite(), this._stage.getNumChildren() - 1);
};

Stage.prototype.getChildIndex = function (child) {
  return this._stage.getChildIndex(child.getSprite());
};

Stage.prototype.setChildIndex = function (child, index) {
  this._stage.setChildIndex(child.getSprite(), index);
};

Stage._resizeHandler = function () {
  this.updateSize();
};

Stage._tickHandler = function () {
  this._stage.update();
};

$(document).ready(function () {
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

  var stage = new Stage($('#stage'));
  stage.installEvents();
  stage.updateSize();

  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
  createjs.Ticker.setFPS(60);
});
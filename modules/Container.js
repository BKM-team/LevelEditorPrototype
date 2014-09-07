'use strict';

var Container = function (parentContainer) {
  this._parentContainer = parentContainer;
  this._container = new createjs.Container();
  this._parentContainer.addChild(this._container);

  this._container.x = 0;
  this._container.y = 0;

  this._width = 0;
  this._height = 0;

  var bg = this._createBackground(0, 0);
  this._container.addChildAt(bg, 0);

  this._container.on('mousedown', Container._mouseDownHandler.bind(this));
  this._container.on('pressup', Container._mouseUpHandler.bind(this));
  this._container.on('pressmove', Container._mouseMoveHandler.bind(this));
  this._dragging = {};
};

Container.prototype.addChild = function (child, positionRelativeToCanvas) {
  var sprite = child.getSprite();
  sprite.x = positionRelativeToCanvas.left - this._container.x;
  sprite.y = positionRelativeToCanvas.top - this._container.y;
  this._container.addChild(sprite);
};

Container.prototype.getChildIndex = function (child) {
  return this._container.getChildIndex(child.getSprite());
};

Container.prototype.setChildIndex = function (child, index) {
  this._container.setChildIndex(child.getSprite(), index);
};

Container.prototype.getChildCount = function () {
  return this._container.getNumChildren();
};

Container.prototype.setSize = function (width, height) {
  this._width = width;
  this._height = height;

  var bg = this._createBackground();
  this._updateBackgroundShape(bg);
  this._container.x = this._container.y = 0;
};

Container.prototype.getSize = function () {
  return {
    width: this._width,
    height: this._height
  };
};

Container.prototype._updateBackgroundShape = function (newBackground) {
  this._container.removeChildAt(0);
  this._container.addChildAt(newBackground, 0);
};

Container.prototype._createBackground = function () {
  var bg = new createjs.Shape();
  bg.x = 0;
  bg.y = 0;

  bg.graphics
    .beginFill('#fff')
    .drawRect(0, 0, this._width, this._height);

  return bg;
};

Container._mouseDownHandler = function (evt) {
  this._dragging.isElementDragged = true;
  this._dragging.startPosition = {
    x: this._container.x - evt.stageX,
    y: this._container.y - evt.stageY
  };
  this._container.cursor = 'move';
};

Container._mouseMoveHandler = function (evt) {
  if(this._dragging.isElementDragged) {
    this._container.x = evt.stageX + this._dragging.startPosition.x;
    this._container.y = evt.stageY + this._dragging.startPosition.y;
  }
};

Container._mouseUpHandler = function () {
  if(this._dragging.isElementDragged) {
    this._dragging.isElementDragged = false;
    this._container.cursor = null;
  }
};

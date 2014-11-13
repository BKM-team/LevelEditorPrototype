'use strict';

var EditorCanvas = function (container) {
  this._container = container;

  this._container.x = 0;
  this._container.y = 0;

  this._width = 0;
  this._height = 0;
  this._gridSize = 0;

  var bg = this._createBackground(0, 0);
  this._container.addChildAt(bg, 0);

  this._container.on('mousedown', EditorCanvas._mouseDownHandler.bind(this));
  this._container.on('pressup', EditorCanvas._mouseUpHandler.bind(this));
  this._container.on('pressmove', EditorCanvas._mouseMoveHandler.bind(this));
  this._dragging = {};
};

EditorCanvas.prototype.addChild = function (child, positionRelativeToCanvas) {
  var sprite = child.getSprite();
  sprite.x = positionRelativeToCanvas.left - this._container.x;
  sprite.y = positionRelativeToCanvas.top - this._container.y;
  this._container.addChild(sprite);
};

EditorCanvas.prototype.getChildIndex = function (child) {
  return this._container.getChildIndex(child.getSprite());
};

EditorCanvas.prototype.setChildIndex = function (child, index) {
  this._container.setChildIndex(child.getSprite(), index);
};

EditorCanvas.prototype.getChildCount = function () {
  return this._container.getNumChildren();
};

EditorCanvas.prototype.setSize = function (width, height) {
  this._width = width;
  this._height = height;

  var bg = this._createBackground();
  this._updateBackgroundShape(bg);
  this._container.x = this._container.y = 0;
};

EditorCanvas.prototype.getSize = function () {
  return {
    width: this._width,
    height: this._height
  };
};

EditorCanvas.prototype.getGridSize = function () {
  return this._gridSize;
};

EditorCanvas.prototype.setGridSize = function (size) {
  this._gridSize = size;
};

EditorCanvas.prototype._updateBackgroundShape = function (newBackground) {
  this._container.removeChildAt(0);
  this._container.addChildAt(newBackground, 0);
};

EditorCanvas.prototype._createBackground = function () {
  var bg = new createjs.Shape();
  bg.x = 0;
  bg.y = 0;

  bg.graphics
    .beginFill('#fff')
    .drawRect(0, 0, this._width, this._height);

  return bg;
};

EditorCanvas._mouseDownHandler = function (evt) {
  this._dragging.isElementDragged = true;
  this._dragging.startPosition = {
    x: this._container.x - evt.stageX,
    y: this._container.y - evt.stageY
  };
  this._container.cursor = 'move';
};

EditorCanvas._mouseMoveHandler = function (evt) {
  if(this._dragging.isElementDragged) {
    this._container.x = evt.stageX + this._dragging.startPosition.x;
    this._container.y = evt.stageY + this._dragging.startPosition.y;
    this.snapToGrid();
  }
};

EditorCanvas._mouseUpHandler = function () {
  if(this._dragging.isElementDragged) {
    this._dragging.isElementDragged = false;
    this._container.cursor = null;
  }
};

EditorCanvas.prototype.snapToGrid = function () {
  var gridSize = this.getGridSize();

  if(this._container.x % gridSize <= gridSize / 2) {
    this._container.x -= this._container.x % gridSize;
  } else {
    this._container.x += gridSize - this._container.x % gridSize;
  }

  if(this._container.y % gridSize <= gridSize / 2) {
    this._container.y -= this._container.y % gridSize;
  } else {
    this._container.y += gridSize - this._container.y % gridSize;
  }
};


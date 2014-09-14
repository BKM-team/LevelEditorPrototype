'use strict';

var Stage = function ($canvas) {
  this._canvas = $canvas;
  this._canvas.on('contextmenu', function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
  });

  this._contextMenu = new ContextMenu();

  this._stage = new createjs.Stage(this._canvas.attr('id'));
  this._stage.enableMouseOver(10);

  this._container = new Container(this._stage);

  var that = this;
  this._canvas.droppable({
    tolerance: 'fit',
    drop: Stage._dropHandler.bind(this),
    over: function (event, ui) {
      ui.helper.css('opacity', '0.5');
      var gridSize = that.getGridSize();
    }
  });

  createjs.Ticker.on('tick', Stage._tickHandler.bind(this));
  $(window).on('resize', Stage._resizeHandler.bind(this));
};

Stage.prototype.setSizeToParent = function () {
  var $canvasParent = this._canvas.parent();
  var $canvasParentDimensions = {
    width: $canvasParent.width(),
    height: $canvasParent.height()
  };

  this._canvas.attr('width', $canvasParentDimensions.width);
  this._canvas.attr('height', $canvasParentDimensions.height);

  this._container.setSize($canvasParentDimensions.width, $canvasParentDimensions.height);
};

Stage.prototype.addChild = function (child) {
  this._container.addChild(child);
};

Stage.prototype.moveChildToTop = function (child) {
  this._container.setChildIndex(child, this._container.getChildCount() - 1);
};

Stage.prototype.moveChildToBottom = function (child) {
  this._container.setChildIndex(child, 0);
};

Stage.prototype.moveChildUp = function (child) {
  var actualIndex = this._container.getChildIndex(child);
  this._container.setChildIndex(child, actualIndex + 1);
};

Stage.prototype.moveChildDown = function (child) {
  var actualIndex = this._container.getChildIndex(child);
  this._container.setChildIndex(child, actualIndex - 1);
};

Stage.prototype.getChildIndex = function (child) {
  return this._container.getChildIndex(child);
};

Stage.prototype.setChildIndex = function (child, index) {
  this._container.setChildIndex(child, index);
};

Stage.prototype.setContainerSize = function (width, height) {
  this._container.setSize(width, height);
};

Stage.prototype.getContainerSize = function () {
  return this._container.getSize();
};

Stage.prototype.showContextMenu = function (editorElement, menuItems, mouseDownEvent) {
  var canvasOffset = this._canvas.offset();
  var position = {
    top: mouseDownEvent.stageY + canvasOffset.top,
    left: mouseDownEvent.stageX + canvasOffset.left
  };

  this._contextMenu.show(editorElement, menuItems, position);
};

Stage.prototype.snapElementToGrid = function (element) {
  this._container.snapElementToGrid(element);
};

Stage.prototype.getGridSize = function () {
  return this._gridSize;
};

Stage.prototype.setGridSize = function (size) {
  this._gridSize = size;
};

Stage.prototype.drawGrid = function () {
  var xOffset = this._container._container.x % this._gridSize;
  var yOffset = this._container._container.y % this._gridSize;
  var x = 0;
  var height = this._canvas.attr('height');
  var width = this._canvas.attr('width');
  var grid = new createjs.Shape();
  grid.graphics.beginStroke('rgba(0,0,0,0.3)');

  for(; x < width; x += this._gridSize) {
    grid.graphics
      .moveTo(x, 0)
      .lineTo(x, height);
  }

  var y = 0;

  for(; y < height; y += this._gridSize) {
    grid.graphics
      .moveTo(0, y)
      .lineTo(width, y);
  }

  grid.x = xOffset;
  grid.y = yOffset;
  this._stage.addChild(grid);
};

Stage._dropHandler = function (event, ui) {
  var element = new EditorElement(ui.helper.eq(0).attr('src'), this);
  var position = ui.helper.posRelativeTo(this._canvas);

  this._container.addChild(element, position);
  ui.helper.remove();
};

Stage._resizeHandler = function () {
  this.setSizeToParent();
};

Stage._tickHandler = function () {
  this._stage.update();
};

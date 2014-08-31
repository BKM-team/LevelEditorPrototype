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

  var that = this;

  this._canvas.droppable({
    tolerance: 'fit',
    drop: Stage._dropHandler.bind(this),
    over: function (event, ui) {
      ui.helper.css('opacity', '0.5');
      ui.draggable.on('drag', function (event, ui) {
        var stagePos = $('#stage').position();
        var pos = ui.position;

        var left = pos.left - stagePos.left;
        var top = pos.top - stagePos.top;

        pos.top = top - top%that.getGridSize() + stagePos.top;
        pos.left = left - left%that.getGridSize() + stagePos.left;
        ui.helper.position(pos);
      });
    }
  });

  createjs.Ticker.on('tick', Stage._tickHandler.bind(this));
  $(window).on('resize', Stage._resizeHandler.bind(this));
};

Stage.prototype.updateSize = function () {
  var $canvasParent = this._canvas.parent();
  this._canvas.attr('width', $canvasParent.width());
  this._canvas.attr('height', $canvasParent.height());
};

Stage.prototype.addChild = function (child) {
  this._stage.addChild(child.getSprite());
};

Stage.prototype.moveChildToTop = function (child) {
  this._stage.setChildIndex(child.getSprite(), this._stage.getNumChildren() - 1);
};

Stage.prototype.moveChildToBottom = function (child) {
  this._stage.setChildIndex(child.getSprite(), 0);
};

Stage.prototype.moveChildUp = function (child) {
  var actualIndex = this.getChildIndex(child);
  this.setChildIndex(child, actualIndex + 1);
};

Stage.prototype.moveChildDown = function (child) {
  var actualIndex = this.getChildIndex(child);
  this.setChildIndex(child, actualIndex - 1);
};

Stage.prototype.getChildIndex = function (child) {
  return this._stage.getChildIndex(child.getSprite());
};

Stage.prototype.setChildIndex = function (child, index) {
  this._stage.setChildIndex(child.getSprite(), index);
};

Stage.prototype.showContextMenu = function (editorElement, menuItems, mouseDownEvent) {
  var canvasOffset = this._canvas.offset();
  var position = {
    top: mouseDownEvent.stageY + canvasOffset.top,
    left: mouseDownEvent.stageX + canvasOffset.left
  };

  this._contextMenu.show(editorElement, menuItems, position);
};

Stage.prototype.setGridSize = function (gridSize) {
  this._gridSize = gridSize;
};

Stage.prototype.getGridSize = function () {
  return this._gridSize;
};

Stage._dropHandler = function (event, ui) {
  var element = new EditorElement(ui.helper.eq(0).attr('src'), this);
  this.addChild(element);
  var position = ui.helper.posRelativeTo(this._canvas);

  element.setPosition({
    x: position.left,
    y: position.top
  });

  element.snapToGrid();

  ui.helper.remove();
};

Stage._resizeHandler = function () {
  this.updateSize();
};

Stage._tickHandler = function () {
  this._stage.update();
};

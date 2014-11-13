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

    var editorCanvasContainer = new createjs.Container();
    this._editorCanvas = new EditorCanvas(editorCanvasContainer);
    this._stage.addChild(editorCanvasContainer);

    var that = this;
    this._canvas.droppable({
        tolerance: 'fit',
        drop: Stage._dropHandler.bind(this),
        over: function (event, ui) {
            ui.helper.css('opacity', '0.5');
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

    var containerSize = {
        width: $canvasParentDimensions.width - ($canvasParentDimensions.width % this.getGridSize()),
        height: $canvasParentDimensions.height - ($canvasParentDimensions.height % this.getGridSize())
    };

    this._editorCanvas.setSize(containerSize.width, containerSize.height);
};

Stage.prototype.addChild = function (child) {
    this._editorCanvas.addChild(child);
};

Stage.prototype.moveChildToTop = function (child) {
    this._editorCanvas.setChildIndex(child, this._editorCanvas.getChildCount() - 1);
};

Stage.prototype.moveChildToBottom = function (child) {
    this._editorCanvas.setChildIndex(child, 0);
};

Stage.prototype.moveChildUp = function (child) {
    var actualIndex = this._editorCanvas.getChildIndex(child);
    this._editorCanvas.setChildIndex(child, actualIndex + 1);
};

Stage.prototype.moveChildDown = function (child) {
    var actualIndex = this._editorCanvas.getChildIndex(child);
    this._editorCanvas.setChildIndex(child, actualIndex - 1);
};

Stage.prototype.getChildIndex = function (child) {
    return this._editorCanvas.getChildIndex(child);
};

Stage.prototype.setChildIndex = function (child, index) {
    this._editorCanvas.setChildIndex(child, index);
};

Stage.prototype.setEditorCanvasSize = function (width, height) {
    var gridSize = this.getGridSize();
    this._editorCanvas.setSize(width * gridSize, height * gridSize);
};

Stage.prototype.getEditorCanvasSize = function () {
    var actualSize = this._editorCanvas.getSize();
    var gridSize = this.getGridSize();

    return {
        width: actualSize.width / gridSize,
        height: actualSize.height / gridSize
    };
};

Stage.prototype.showContextMenu = function (editorElement, menuItems, mouseDownEvent) {
    var canvasOffset = this._canvas.offset();
    var position = {
        top: mouseDownEvent.stageY + canvasOffset.top,
        left: mouseDownEvent.stageX + canvasOffset.left
    };

    this._contextMenu.show(editorElement, menuItems, position);
};

Stage.prototype.getGridSize = function () {
    return this._gridSize;
};

Stage.prototype.setGridSize = function (size) {
    this._gridSize = size;
    this._editorCanvas.setGridSize(size);
};

Stage.prototype.updateGrid = function () {
    this._stage.removeChildAt(this._stage.children.length - 1);
    this.drawGrid();
};

Stage.prototype.drawGrid = function () {
    var x = 0, y = 0;
    var height = this._canvas.attr('height');
    var width = this._canvas.attr('width');

    var grid = new createjs.Shape();
    grid.graphics.beginFill('black');

    for (; x < width; x += this._gridSize) {
        for (y = 0; y < height; y += this._gridSize) {
            grid.graphics.drawRect(x, y, 1, 1);
        }
    }

    grid.x = 0;
    grid.y = 0;

    //grid needs to be cached, since if it's too small (i.e. too many dots on the screen) it can kill performance
    grid.cache(0, 0, width, height);

    this._stage.addChild(grid);
};

Stage._dropHandler = function (event, ui) {
    var element = new EditorElement(ui.helper.eq(0).attr('src'), this);
    var position = ui.helper.posRelativeTo(this._canvas);

    this._editorCanvas.addChild(element, position);
    element.snapToGrid();
    ui.helper.remove();
};

Stage._resizeHandler = function () {
    this.setSizeToParent();
};

Stage._tickHandler = function () {
    this._stage.update();
};

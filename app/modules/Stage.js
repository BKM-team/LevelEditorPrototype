'use strict';

var Stage = function (stageElement) {
    this._stage = new createjs.Stage(stageElement);
    this._stage.enableMouseOver(10);
    createjs.Ticker.on('tick', this._tickHandler, this);

    this._gridSize = Stage._GRID_SIZE;

    this._container = new createjs.Container();
    this._stage.addChild(this._container);

    var backgroundPlaceholder = new createjs.Shape();
    this._container.addChildAt(backgroundPlaceholder, Stage._BACKGROUND_INDEX);

    this._layers = [];
    this._layersContainer = new createjs.Container();
    this._layersContainer.x = 0;
    this._layersContainer.y = 0;
    this.addLayer(Stage._DEFAULT_BACKGROUND_LAYER_NAME);
    this._activeLayer = 0;
    this._container.addChildAt(this._layersContainer, Stage._LAYER_CONTAINER_INDEX);

    this._stage.on('mousedown', this._mouseDownHandler, this);
    this._stage.on('pressup', this._mouseUpHandler, this);
    this._stage.on('pressmove', this._mouseMoveHandler, this);
    this._dragging = {};
};

//TODO: someday allow user to change the grid size again
Stage._GRID_SIZE = 32;
Stage._DEFAULT_BACKGROUND_LAYER_NAME = 'background';
Stage._BACKGROUND_INDEX = 0;
Stage._LAYER_CONTAINER_INDEX = 1;
Stage._GRID_INDEX = 2;

Stage.prototype.addChild = function (child, positionRelativeToCanvas) {
    var sprite = child.getSprite();
    sprite.x = positionRelativeToCanvas.left - this._container.x;
    sprite.y = positionRelativeToCanvas.top - this._container.y;

    this.snapObjectToGrid(sprite);

    this._layers[this._activeLayer].addChild(sprite);
};

Stage.prototype.snapObjectToGrid = function (object) {
    var gridSize = this.getGridSize();

    if (object.x % gridSize <= gridSize / 2) {
        object.x -= object.x % gridSize;
    } else {
        object.x += gridSize - object.x % gridSize;
    }

    if (object.y % gridSize <= gridSize / 2) {
        object.y -= object.y % gridSize;
    } else {
        object.y += gridSize - object.y % gridSize;
    }
};

Stage.prototype.setSize = function (xTilesCount, yTilesCount) {
    this._width = xTilesCount * this._gridSize;
    this._height = yTilesCount * this._gridSize;

    var bg = this._createBackground();
    this._updateBackgroundShape(bg);

    this._container.x = this._container.y = 0;
};

Stage.prototype.getGridSize = function () {
    return this._gridSize;
};

Stage.prototype._updateBackgroundShape = function (newBackground) {
    this._container.removeChildAt(0);
    this._container.addChildAt(newBackground, 0);
};

Stage.prototype._updateGrid = function (newGrid) {
    this._stage.removeChildAt(1);
    this._stage.addChildAt(newGrid, 1);
};

Stage.prototype._createBackground = function () {
    var bg = new createjs.Shape();
    bg.x = 0;
    bg.y = 0;

    bg.graphics
        .beginFill('#fff')
        .drawRect(0, 0, this._width, this._height);

    return bg;
};

Stage.prototype._createGrid = function (width, height) {
    var x = 0, y = 0;

    var GRID_ELEMENT_SIZE = 1;

    var grid = new createjs.Shape();
    grid.graphics.beginFill('black');

    for (; x <= width; x += this._gridSize) {
        for (y = 0; y <= height; y += this._gridSize) {
            grid.graphics.drawRect(x, y, GRID_ELEMENT_SIZE, GRID_ELEMENT_SIZE);
        }
    }

    grid.x = 0;
    grid.y = 0;

    //grid needs to be cached, since if it's too small (i.e. too many dots on the screen) it can kill performance
    grid.cache(0, 0, width + 1, height + 1);

    return grid;
};

Stage.prototype.drawGrid = function (width, height) {
    var grid = this._createGrid(width, height);
    this._updateGrid(grid);
};

Stage.prototype._mouseDownHandler = function (evt) {
    this._dragging.isElementDragged = true;
    this._dragging.startPosition = {
        x: this._container.x - evt.stageX,
        y: this._container.y - evt.stageY
    };
    this._stage.cursor = 'move';
};

Stage.prototype._mouseMoveHandler = function (evt) {
    if (this._dragging.isElementDragged) {
        this._container.x = evt.stageX + this._dragging.startPosition.x;
        this._container.y = evt.stageY + this._dragging.startPosition.y;
        this.snapToGrid();
    }
};

Stage.prototype._mouseUpHandler = function () {
    if (this._dragging.isElementDragged) {
        this._dragging.isElementDragged = false;
        this._stage.cursor = null;
    }
};

Stage.prototype._tickHandler = function () {
    this._stage.update();
};

Stage.prototype.snapToGrid = function () {
    this.snapObjectToGrid(this._container);
};

Stage.prototype.addLayer = function (name) {
    this._layers.push(new Layer(name));
    this._layersContainer.addChild(this._layers[this._layers.length - 1].getContainer());
};

Stage.prototype.getLayersList = function () {
    return this._layers.map(function (layer, index) {
        return {
            name: layer.getName(),
            active: index === this._activeLayer,
            visible: layer.getVisibility(),
            isFirst: index === 0,
            isLast: index === this._layers.length - 1
        } ;
    }, this);
};

Stage.prototype.setActiveLayer = function (index) {
    this._activeLayer = index;
};

Stage.prototype.changeLayerVisibility = function (index, visibility) {
    var layer = this._layers[index];
    visibility ? layer.show() : layer.hide();
};

Stage.prototype.deleteLayer = function (index) {
    if(this._layers.length === 1) {
        return;
    }

    this._layersContainer.removeChildAt(index);
    this._layers.splice(index, 1);

    if(index === this._activeLayer) {
        this._activeLayer = 0;
    } else if (index < this._activeLayer) {
        this._activeLayer -= 1;
    }
};

Stage.prototype.moveLayerUp = function (index) {
    this._swapLayers(index, index - 1);
    if(this._activeLayer === index) {
        this._activeLayer = index - 1;
    } else if (this._activeLayer === index - 1) {
        this._activeLayer = index;
    }
};

Stage.prototype.moveLayerDown = function (index) {
    this._swapLayers(index, index + 1);
    if(this._activeLayer === index) {
        this._activeLayer = index + 1;
    } else if (this._activeLayer === index + 1) {
        this._activeLayer = index;
    }
};

Stage.prototype._swapLayers = function (l1, l2) {
    var tmp = this._layers[l1];
    this._layers[l1] = this._layers[l2];
    this._layers[l2] = tmp;

    this._layersContainer.swapChildrenAt(l1, l2);
};

Stage.prototype.toJSON = function () {
    var serializedObj = {
        width: this._width % this._gridSize,
        height: this._height % this._gridSize,
        tileheight: this._gridSize,
        tilewidth: this._gridSize,
        layers: this._layers.map(function (layer) {
            return layer.toJSON();
        }),
        tilesets: [],
        orientation: "orthogonal",
        //these below probably doesn't have any influence on Phaser, basing on its TilemapParser source
        //leaving it here for compatibility
        renderorder: "right-down",
        version: 1
    };

    //currently only simple layers are supported
    //it means each has the size equal to the stage and is placed on (0,0)
    serializedObj.layers.forEach(function (layer) {
        layer.x = layer.y = 0;
        layer.width = serializedObj.width;
        layer.height = serializedObj.height;
    });

    return serializedObj;
};

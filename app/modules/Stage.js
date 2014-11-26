'use strict';

var Stage = function (stageElement, xTileCount, yTileCount, gridSize) {
    this._stage = new createjs.Stage(stageElement);
    this._stage.enableMouseOver(10);
    createjs.Ticker.on('tick', this._tickHandler, this);

    this._gridSize = gridSize;

    Object.defineProperties(this, {
        _xTileCount: Stage._xTileCountGetSet,
        _yTileCount: Stage._yTileCountGetSet
    });

    this._container = new createjs.Container();
    this._stage.addChild(this._container);

    this.setSize(xTileCount, yTileCount);
    this.drawGrid(this._width, this._height);

    this._layers = [];
    this._layersContainer = new createjs.Container();
    this.addLayer(Stage._DEFAULT_BACKGROUND_LAYER.NAME, Stage._DEFAULT_BACKGROUND_LAYER.TYPE);
    this._activeLayer = 0;
    this._container.addChildAt(this._layersContainer, Stage._LAYER_CONTAINER_INDEX_ON_CONTAINER);

    this._activeTool = Stage._DEFAULT_ACTIVE_TOOL;
};

Stage._DEFAULT_BACKGROUND_LAYER = {
    NAME: 'background',
    TYPE: Layer.TILE_LAYER
};
Stage._BACKGROUND_INDEX_ON_CONTAINER = 0;
Stage._LAYER_CONTAINER_INDEX_ON_CONTAINER = 1;
Stage._GRID_INDEX_ON_STAGE = 1;
Stage.TOOL = {
    BRUSH: 0,
    RUBBER: 1
};
Stage._DEFAULT_ACTIVE_TOOL = Stage.TOOL.BRUSH;

Stage._xTileCountGetSet = {
    get: function () {
        return this._width / this._gridSize;
    },
    set: function (xTileCount) {
        this._width = xTileCount * this._gridSize;
    }
};

Stage._yTileCountGetSet = {
    get: function () {
        return this._height / this._gridSize;
    },
    set: function (yTileCount) {
        this._height = yTileCount * this._gridSize;
    }
};

Stage.prototype.addChild = function (child, positionRelativeToCanvas) {
    var sprite = child.getSprite();
    sprite.x = positionRelativeToCanvas.left - this._container.x;
    sprite.y = positionRelativeToCanvas.top - this._container.y;
    this.snapObjectToGrid(sprite);

    if(this._layers[this._activeLayer] instanceof ObjectLayer) {
        this._layers[this._activeLayer].addChild(child);
    } else {
        var spriteColumn = sprite.x / this._gridSize;
        var spriteRow = sprite.y / this._gridSize;
        var tileIndex = spriteColumn + spriteRow * this._width / this._gridSize;
        this._layers[this._activeLayer].addChild(child, tileIndex);
    }
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

Stage.prototype.setSize = function (xTileCount, yTileCount) {
    this._xTileCount = xTileCount;
    this._yTileCount = yTileCount;

    var bg = this._createBackground();
    this._updateBackgroundShape(bg);

    this._container.x = this._container.y = 0;
};

Stage.prototype.getGridSize = function () {
    return this._gridSize;
};

Stage.prototype._updateBackgroundShape = function (newBackground) {
    this._container.removeChildAt(Stage._BACKGROUND_INDEX_ON_CONTAINER);
    this._container.addChildAt(newBackground, Stage._BACKGROUND_INDEX_ON_CONTAINER);
};

Stage.prototype._updateGrid = function (newGrid) {
    this._stage.removeChildAt(Stage._GRID_INDEX_ON_STAGE);
    this._stage.addChildAt(newGrid, Stage._GRID_INDEX_ON_STAGE);
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

Stage.prototype._tickHandler = function () {
    this._stage.update();
};

Stage.prototype.snapToGrid = function () {
    this.snapObjectToGrid(this._container);
};

Stage.prototype.addLayer = function (name, type) {
    var newLayer;

    switch(type) {
        case Layer.TILE_LAYER:
            newLayer = new TileLayer(name, this._xTileCount * this._yTileCount);
            break;

        case Layer.OBJECT_LAYER:
            newLayer = new ObjectLayer(name);
            break;
    }

    this._layers.push(newLayer);
    this._layersContainer.addChild(newLayer.getContainer());
};

Stage.prototype.getLayersList = function () {
    return this._layers.map(function (layer, index) {
        return {
            name: layer.getName(),
            active: index === this._activeLayer,
            visible: layer.getVisibility(),
            isFirst: index === 0,
            isLast: index === this._layers.length - 1,
            type: layer.getLayerType()
        } ;
    }, this);
};

Stage.prototype.setActiveLayer = function (index) {
    this._activeLayer = index;
    switch (this._layers[this._activeLayer].getLayerType()) {
        case Layer.TILE_LAYER:
            this._brush = 0;
            this.setActiveTool(Stage.TOOL.BRUSH);
            break;

        case Layer.OBJECT_LAYER:
            this.setActiveTool(Stage.TOOL.DRAG);
            break;
    }
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
        width: this._xTileCount,
        height: this._yTileCount,
        tileheight: this._gridSize,
        tilewidth: this._gridSize,
        layers: this._layers.map(function (layer) {
            return layer.toJSON();
        }),
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

Stage.prototype.setActiveTool = function (tool) {
    this._activeTool = tool;
};

Stage.prototype.getActiveTool = function () {
    return this._activeTool;
};

'use strict';

var TileLayer = function (name, layerElementsCount) {
    this.__base.constructor.call(this, name);
    var emptyChild;

    for(var i = 0; i < layerElementsCount; i++) {
        emptyChild = TileLayer._getEmptyChild();
        this._elements.push(emptyChild);
        this._spritesContainer.addChild(emptyChild.getSprite());
    }

    this._drawing = {
        previousTileIndex: null,
        image: null
    };
};

TileLayer.prototype = Object.create(Layer.prototype);
TileLayer.prototype.constructor = TileLayer;
TileLayer.prototype.__base = Layer.prototype;
Object.defineProperty(TileLayer.prototype, '_type', {
    value: Layer.TILE_LAYER
});

TileLayer._getEmptyChild = function () {
  return new TileElement();
};

TileLayer.prototype.setDrawingImage = function (image) {
    this._drawing.image = image;
};

TileLayer.prototype.setDrawingPreviousTileIndex = function (previousTileIndex) {
    this._drawing.previousTileIndex = previousTileIndex;
};

TileLayer.prototype.getDrawingImage = function () {
    return this._drawing.image;
};

TileLayer.prototype.getDrawingPreviousTileIndex = function () {
    return this._drawing.previousTileIndex;
};

TileLayer.prototype.addChild = function (child, tileIndex) {
    this._elements[tileIndex] = child;
    this._spritesContainer.addChildAt(child.getSprite(), tileIndex);
    this._spritesContainer.removeChildAt(tileIndex + 1);
};

TileLayer.prototype.removeChild = function (tileIndex) {
    this.addChild(TileLayer._getEmptyChild(), tileIndex);
};

TileLayer.prototype.toJSON = function () {
    return jQuery.extend(this.__base.toJSON.call(this), {
        type: "tilelayer",
        data: this._elements.map(function (element) {
            return element.toJSON();
        })
    });
};

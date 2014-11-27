'use strict';

var TileLayer = function (name, layerElementsCount) {
    this.__base.constructor.call(this, name);
    var emptyChild;

    for(var i = 0; i < layerElementsCount; i++) {
        emptyChild = new TileElement();
        this._elements.push(emptyChild);
        this._spritesContainer.addChild(emptyChild.getSprite());
    }
};

TileLayer.prototype = Object.create(Layer.prototype);
TileLayer.prototype.constructor = TileLayer;
TileLayer.prototype.__base = Layer.prototype;
Object.defineProperty(TileLayer.prototype, '_type', {
    value: Layer.TILE_LAYER
});

TileLayer.prototype.addChild = function (child, tileIndex) {
    this._elements[tileIndex] = child;
    this._spritesContainer.addChildAt(child.getSprite(), tileIndex);
    this._spritesContainer.removeChildAt(tileIndex + 1);
};

TileLayer.prototype.toJSON = function () {
    return jQuery.extend(this.__base.toJSON.call(this), {
        type: "tilelayer",
        data: this._elements.map(function (element) {
            return element.toJSON();
        })
    });
};

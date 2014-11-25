'use strict';

var TileLayer = function (name, layerElementsCount) {
    var NO_ASSET_GID = 0;

    this.__base.constructor.call(this, name);
    for(var i = 0; i < layerElementsCount; i++) {
        this._elements.push(NO_ASSET_GID);
    }
};

TileLayer.prototype = Object.create(Layer.prototype);
TileLayer.prototype.constructor = TileLayer;
TileLayer.prototype.__base = Layer.prototype;
Object.defineProperty(TileLayer.prototype, '_type', {
    value: Layer.TILE_LAYER
});

TileLayer.prototype.addChild = function (child, tileIndex) {
    this._elements[tileIndex] = child.getFrameId();
    this._spritesContainer.addChild(child.getSprite());
};

TileLayer.prototype.toJSON = function () {
    return jQuery.extend(this.__base.prototype.toJSON.call(this), {
        type: "tilelayer",
        data: this._elements.map(function (element) {
            return element.toJSON();
        })
    });
};

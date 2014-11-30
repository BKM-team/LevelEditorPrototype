'use strict';

var ObjectLayer = function (name) {
    this.__base.constructor.call(this, name);
};

ObjectLayer.prototype = Object.create(Layer.prototype);
ObjectLayer.prototype.constructor = ObjectLayer;
ObjectLayer.prototype.__base = Layer.prototype;
Object.defineProperty(ObjectLayer.prototype, '_type', {
    value: Layer.OBJECT_LAYER
});

ObjectLayer.prototype.removeChild = function (child) {
    var childIndex = this._elements.indexOf(child);
    this._elements.splice(childIndex, 1);
    this._spritesContainer.removeChild(child.getSprite());
};

ObjectLayer.prototype.toJSON = function () {
    return jQuery.extend(this.__base.toJSON.call(this), {
        type: "objectgroup",
        //TODO: add support for moving objects in z axis
        draworder: "index",
        objects: this._elements.map(function (element) {
            return element.toJSON();
        })
    });
};

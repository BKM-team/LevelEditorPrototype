'use strict';

var Layer = function (name) {
    this._spritesContainer = new createjs.Container();
    this._elements = [];
    this.setName(name);
    Object.defineProperty(this, '_visible', Layer._visibleGetSet);
    this._spritesContainer.x = 0;
    this._spritesContainer.y = 0;

    this.show();
};

Layer.TILE_LAYER = 0;
Layer.OBJECT_LAYER = 1;

Layer._visibleGetSet = {
    get: function () {
        return this._spritesContainer.visible;
    },
    set: function (val) {
        this._spritesContainer.visible = val;
    }
};

Layer.prototype.getContainer = function () {
    return this._spritesContainer;
};

Layer.prototype.getName = function () {
    return this._name;
};

Layer.prototype.setName = function (name) {
    this._name = name;
};

Layer.prototype.show = function () {
    this._visible = true;
};

Layer.prototype.hide = function () {
    this._visible = false;
};

Layer.prototype.getVisibility = function () {
    return this._visible;
};

Layer.prototype.getLayerType = function () {
    return this._type;
};

Layer.prototype.addChild = function (child) {
    this._elements.push(child);
    this._spritesContainer.addChild(child.getSprite());
};

Layer.prototype.toJSON = function () {
    return {
        name: this.getName(),
        visible: this.getVisibility(),
        //TODO: support opacity change
        opacity: 1,
        //TODO: add support for layer position and size. Currently these will be overwritten by Stage
        x: null,
        y: null,
        width: null,
        height: null
    }
};

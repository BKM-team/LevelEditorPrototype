'use strict';

var TileElement = function ($image) {
    this._frameId = parseInt($image.attr('data-frame-id'), 10);
    this._sprite = new createjs.Bitmap($image.get(0));

    Object.defineProperty(this, 'x', TileElement._xGetSet);
    Object.defineProperty(this, 'y', TileElement._yGetSet);
};

TileElement._xGetSet = {
    get: function () {
        return this._sprite.x;
    },
    set: function (val) {
        this._sprite.x = val;
    }
};

TileElement._yGetSet = {
    get: function () {
        return this._sprite.y;
    },
    set: function (val) {
        this._sprite.y = val;
    }
};

TileElement.prototype.getSprite = function () {
    return this._sprite;
};

TileElement.prototype.getFrameId = function () {
    return this._frameId;
};

TileElement.prototype.toJSON = function () {
    return this.getFrameId();
};

'use strict';

var Layer = function (name) {
    this._container = new createjs.Container();
    this.setName(name);
    Object.defineProperty(this, '_visible', Layer._visibleGetSet);
    this._container.x = 0;
    this._container.y = 0;

    this.show();
};

Layer._visibleGetSet = {
    get: function () {
        return this._container.visible;
    },
    set: function (val) {
        this._container.visible = val;
    }
};

Layer.prototype.getContainer = function () {
    return this._container;
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

Layer.prototype.addChild = function (child) {
    this._container.addChild(child);
};

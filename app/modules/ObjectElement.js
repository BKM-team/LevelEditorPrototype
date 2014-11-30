'use strict';

var ObjectElement = function ($image, parentStage) {
    this.__base.constructor.call(this, $image);
    this._parentStage = parentStage;

    this._sprite.on('mousedown', ObjectElement._mouseDownHandler, this);
    this._sprite.on('pressup', ObjectElement._mouseUpHandler, this);
    this._sprite.on('pressmove', ObjectElement._mouseMoveHandler, this);
    this._sprite.cursor = 'pointer';
    this._dragging = {};
};

ObjectElement.prototype = Object.create(TileElement.prototype);
ObjectElement.prototype.constructor = TileElement;
ObjectElement.prototype.__base = TileElement.prototype;

ObjectElement._NORMAL_ALPHA_LEVEL = 1;
ObjectElement._DRAGGED_ITEM_ALPHA_LEVEL = 0.5;

ObjectElement._mouseDownHandler = function (evt) {
    var LEFT_BUTTON = 0,
        RIGHT_BUTTON = 2;

    evt.stopPropagation();

    switch (evt.nativeEvent.button) {
        case LEFT_BUTTON:
            return ObjectElement._mouseDownLeftButtonHandler.apply(this, arguments);
            break;

        case RIGHT_BUTTON:
            return ObjectElement._mouseDownRightButtonHandler.apply(this, arguments);
            break;
    }
};

ObjectElement._mouseDownLeftButtonHandler = function (evt) {
    this._dragging.isElementDragged = true;
    this._dragging.startPosition = {
        x: this.x - evt.stageX,
        y: this.y - evt.stageY
    };
};

ObjectElement._mouseDownRightButtonHandler = function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
};

ObjectElement._mouseMoveHandler = function (evt) {
    if (this._dragging.isElementDragged) {
        this.x = evt.stageX + this._dragging.startPosition.x;
        this.y = evt.stageY + this._dragging.startPosition.y;

        this._parentStage.snapObjectToGrid(this);

        this._sprite.alpha = ObjectElement._DRAGGED_ITEM_ALPHA_LEVEL;
    }
};

ObjectElement._mouseUpHandler = function () {
    if (this._dragging.isElementDragged) {
        this._dragging.isElementDragged = false;
        this._sprite.alpha = ObjectElement._NORMAL_ALPHA_LEVEL;
    }
};

ObjectElement.prototype.getSprite = function () {
    return this._sprite;
};

ObjectElement.prototype.toJSON = function () {
    var spriteBounds = this._sprite.getBounds();
    return {
        gid: this.getFrameId(),
        width: spriteBounds.width,
        height: spriteBounds.height,
        x: this.x,
        y: this.y,
        //TODO: support customizing objects at least to below properties
        name: '',
        properties: {},
        type: '',
        visible: true,
        rotation: 0
    }
};

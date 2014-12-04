'use strict';

var ObjectElement = function ($image, parentStage) {
    this.__base.constructor.call(this, $image);
    this._parentStage = parentStage;
    this._properties = {};
    this._name = '';
    this._type = '';

    this._addHitArea();

    this._sprite.on('mousedown', this._mouseDownHandler, this);
    this._sprite.on('pressup', this._mouseUpHandler, this);
    this._sprite.on('pressmove', this._mouseMoveHandler, this);
    this._sprite.cursor = 'pointer';
    this._dragging = {};
};

ObjectElement.prototype = Object.create(TileElement.prototype);
ObjectElement.prototype.constructor = TileElement;
ObjectElement.prototype.__base = TileElement.prototype;

ObjectElement._NORMAL_ALPHA_LEVEL = 1;
ObjectElement._DRAGGED_ITEM_ALPHA_LEVEL = 0.5;

ObjectElement._CONTEXT_MENU = [
    {
        title: 'Properties...',
        action: function () {
            this._parentStage.editObjectProperties(this);
        }
    },
    {
        title: 'Delete',
        action: function () {
            this._parentStage.removeChild(this);
        }
    }
];

ObjectElement.prototype._addHitArea = function () {
    var spriteBounds = this._sprite.getBounds();

    var hitArea = new createjs.Shape();
    hitArea.graphics
        .beginFill('#000')//any color can be used here, black were chosen
        .drawRect(spriteBounds.x, spriteBounds.y, spriteBounds.width, spriteBounds.height);

    this._sprite.hitArea = hitArea;
};

ObjectElement.prototype._mouseDownHandler = function (evt) {
    var LEFT_BUTTON = 0,
        RIGHT_BUTTON = 2;

    evt.stopPropagation();

    switch (evt.nativeEvent.button) {
        case LEFT_BUTTON:
            return this._mouseDownLeftButtonHandler(evt);
            break;

        case RIGHT_BUTTON:
            return this._mouseDownRightButtonHandler(evt);
            break;
    }
};

ObjectElement.prototype._mouseDownLeftButtonHandler = function (evt) {
    this._dragging.isElementDragged = true;
    this._dragging.startPosition = {
        x: this.x - evt.stageX,
        y: this.y - evt.stageY
    };
};

ObjectElement.prototype._mouseDownRightButtonHandler = function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this._parentStage.showContextMenu(this, ObjectElement._CONTEXT_MENU, evt);
};

ObjectElement.prototype._mouseMoveHandler = function (evt) {
    if (this._dragging.isElementDragged) {
        this.x = evt.stageX + this._dragging.startPosition.x;
        this.y = evt.stageY + this._dragging.startPosition.y;

        this._parentStage.snapObjectToGrid(this);

        this._sprite.alpha = ObjectElement._DRAGGED_ITEM_ALPHA_LEVEL;
    }
};

ObjectElement.prototype._mouseUpHandler = function () {
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
        name: this.getName(),
        properties: this.getProperties(),
        type: this.getType(),
        visible: true,
        rotation: 0,
        _sprite: this._sprite
    }
};

ObjectElement.prototype.getName = function () {
    return this._name;
};

ObjectElement.prototype.setName = function (name) {
    this._name = name;
};

ObjectElement.prototype.getType = function () {
    return this._type;
};

ObjectElement.prototype.setType = function (type) {
    this._type = type;
};

ObjectElement.prototype.getProperties = function () {
    return this._properties;
};

ObjectElement.prototype.setProperty = function (name, value) {
    this._properties[name] = value;
};

ObjectElement.prototype.setProperties = function (properties) {
    Object.getOwnPropertyNames(properties).forEach(function (propertyName) {
        this.setProperty(propertyName, properties[propertyName]);
    }, this);
};

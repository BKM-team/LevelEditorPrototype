'use strict';

var EditorElement = function ($image, parentStage) {
    this._frameId = parseInt($image.attr('data-frame-id'), 10);
    this._sprite = new createjs.Bitmap($image.get(0));

    this._sprite.on('mousedown', EditorElement._mouseDownHandler, this);
    this._sprite.on('pressup', EditorElement._mouseUpHandler, this);
    this._sprite.on('pressmove', EditorElement._mouseMoveHandler, this);
    this._sprite.cursor = 'pointer';

    this._parentStage = parentStage;

    this._dragging = {};

    this._contextMenu = EditorElement._contextMenu;

    Object.defineProperty(this, 'x', EditorElement._xGetSet);
    Object.defineProperty(this, 'y', EditorElement._yGetSet);
};

EditorElement._NORMAL_ALPHA_LEVEL = 1;
EditorElement._DRAGGED_ITEM_ALPHA_LEVEL = 0.5;

EditorElement._xGetSet = {
    get: function () {
        return this._sprite.x;
    },
    set: function (val) {
        this._sprite.x = val;
    }
};

EditorElement._yGetSet = {
    get: function () {
        return this._sprite.y;
    },
    set: function (val) {
        this._sprite.y = val;
    }
};

EditorElement._mouseDownHandler = function (evt) {
    var LEFT_BUTTON = 0,
        RIGHT_BUTTON = 2;

    evt.stopPropagation();

    switch (evt.nativeEvent.button) {
        case LEFT_BUTTON:
            return EditorElement._mouseDownLeftButtonHandler.apply(this, arguments);
            break;

        case RIGHT_BUTTON:
            return EditorElement._mouseDownRightButtonHandler.apply(this, arguments);
            break;
    }
};

EditorElement._mouseDownLeftButtonHandler = function (evt) {
    this._dragging.isElementDragged = true;
    this._dragging.startPosition = {
        x: this.x - evt.stageX,
        y: this.y - evt.stageY
    };
};

EditorElement._mouseDownRightButtonHandler = function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
};

EditorElement._mouseMoveHandler = function (evt) {
    if (this._dragging.isElementDragged) {
        this.x = evt.stageX + this._dragging.startPosition.x;
        this.y = evt.stageY + this._dragging.startPosition.y;

        this._parentStage.snapObjectToGrid(this);

        this._sprite.alpha = EditorElement._DRAGGED_ITEM_ALPHA_LEVEL;
    }
};

EditorElement._mouseUpHandler = function () {
    if (this._dragging.isElementDragged) {
        this._dragging.isElementDragged = false;
        this._sprite.alpha = EditorElement._NORMAL_ALPHA_LEVEL;
    }
};

EditorElement.prototype.getSprite = function () {
    return this._sprite;
};

EditorElement.prototype.getFrameId = function () {
    return this._frameId;
};

EditorElement.prototype.toJSON = function () {
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

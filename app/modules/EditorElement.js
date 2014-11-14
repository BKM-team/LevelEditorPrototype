'use strict';

var EditorElement = function (imageSrc, parentStage) {
    this._sprite = new createjs.Bitmap(imageSrc);

    this._sprite.on('mousedown', EditorElement._mouseDownHandler.bind(this));
    this._sprite.on('pressup', EditorElement._mouseUpHandler.bind(this));
    this._sprite.on('pressmove', EditorElement._mouseMoveHandler.bind(this));
    this._sprite.cursor = 'pointer';

    this._parentStage = parentStage;

    this._dragging = {};

    this._contextMenu = EditorElement._contextMenu;

    Object.defineProperty(this, 'x', EditorElement._xGetSet);
    Object.defineProperty(this, 'y', EditorElement._yGetSet);
};

EditorElement._contextMenu = [
    {
        title: 'Move',
        children: [
            {
                title: 'to the top',
                action: function () {
                    this._parentStage.moveChildToTop(this);
                }
            },
            {
                title: 'up',
                action: function () {
                    this._parentStage.moveChildUp(this);
                }
            },
            {
                title: 'down',
                action: function () {
                    this._parentStage.moveChildDown(this);
                }
            },
            {
                title: 'to the bottom',
                action: function () {
                    this._parentStage.moveChildToBottom(this);
                }
            }
        ]
    }
];

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
    //this._dragging.startZIndex = this._parentStage.getChildIndex(this);
    this._dragging.startPosition = {
        x: this.x - evt.stageX,
        y: this.y - evt.stageY
    };
};

EditorElement._mouseDownRightButtonHandler = function (evt) {
    evt.preventDefault();
    evt.stopPropagation();

    //this._parentStage.showContextMenu(this, this._contextMenu, evt);
};

EditorElement._mouseMoveHandler = function (evt) {
    if (this._dragging.isElementDragged) {
        this.x = evt.stageX + this._dragging.startPosition.x;
        this.y = evt.stageY + this._dragging.startPosition.y;

        this.snapToGrid();

        this._sprite.alpha = 0.5;
        //this._parentStage.moveChildToTop(this);
    }
};

EditorElement._mouseUpHandler = function () {
    if (this._dragging.isElementDragged) {
        this._dragging.isElementDragged = false;
        this._sprite.alpha = 1;
       // this._parentStage.setChildIndex(this, this._dragging.startZIndex);
    }
};

EditorElement.prototype.getSprite = function () {
    return this._sprite;
};

EditorElement.prototype.snapToGrid = function () {
    var gridSize = this._parentStage.getGridSize();

    if (this.x % gridSize <= gridSize / 2) {
        this.x -= this.x % gridSize;
    } else {
        this.x += gridSize - this.x % gridSize;
    }

    if (this.y % gridSize <= gridSize / 2) {
        this.y -= this.y % gridSize;
    } else {
        this.y += gridSize - this.y % gridSize;
    }
};

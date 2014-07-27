'use strict';

$.fn.posRelativeTo = function (element) {
  var thisOffset = this.offset();
  var elementOffset = element.offset();
  var dx = thisOffset.left - elementOffset.left;
  var dy = thisOffset.top - elementOffset.top;
  return {
    top: dy,
    left: dx
  };
};

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

  switch(evt.nativeEvent.button) {
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
  this._dragging.startZIndex = this._parentStage.getChildIndex(this);
  this._dragging.startPosition = {
    x: this.x - evt.stageX,
    y: this.y - evt.stageY
  };

  this._sprite.alpha = 0.5;

  this._parentStage.moveChildToTop(this);
};

EditorElement._mouseDownRightButtonHandler = function (evt) {
  evt.preventDefault();
  evt.stopPropagation();

  this._parentStage.showContextMenu(this, this._contextMenu, evt);
};

EditorElement._mouseMoveHandler = function (evt) {
  if(this._dragging.isElementDragged) {
    this.x = evt.stageX + this._dragging.startPosition.x;
    this.y = evt.stageY + this._dragging.startPosition.y;
  }
};

EditorElement._mouseUpHandler = function () {
  if(this._dragging.isElementDragged) {
    this._dragging.isElementDragged = false;
    this._sprite.alpha = 1;
    this._parentStage.setChildIndex(this, this._dragging.startZIndex);
  }
};

EditorElement.prototype.setPosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

EditorElement.prototype.getSprite = function () {
  return this._sprite;
};

var Stage = function ($canvas) {
  this._canvas = $canvas;

  this._contextMenuPositioner = $('<div />', {
    'class': 'contextMenuPositioner'
  }).insertBefore(this._canvas);

  this._canvas
    .add(this._contextMenuPositioner)
    .on('contextmenu', function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    });

  this._contextMenuPositioner.contextmenu({
    menu: []
  });

  this._stage = new createjs.Stage(this._canvas.attr('id'));
  this._stage.enableMouseOver(10);

  this._canvas.droppable({
    tolerance: 'fit',
    drop: Stage._dropHandler.bind(this)
  });

  this._contextMenuPositioner.contextmenu({
    menu: [],
    autoTrigger: false
  });

  createjs.Ticker.on('tick', Stage._tickHandler.bind(this));
  $(window).on('resize', Stage._resizeHandler.bind(this));
};

Stage.prototype.updateSize = function () {
  var $canvasParent = this._canvas.parent();
  this._canvas.attr('width', $canvasParent.width());
  this._canvas.attr('height', $canvasParent.height());
};

Stage.prototype.addChild = function (child) {
  this._stage.addChild(child.getSprite());
};

Stage.prototype.moveChildToTop = function (child) {
  this._stage.setChildIndex(child.getSprite(), this._stage.getNumChildren() - 1);
};

Stage.prototype.moveChildToBottom = function (child) {
  this._stage.setChildIndex(child.getSprite(), 0);
};

Stage.prototype.moveChildUp = function (child) {
  var actualIndex = this.getChildIndex(child);
  this.setChildIndex(child, actualIndex + 1);
};

Stage.prototype.moveChildDown = function (child) {
  var actualIndex = this.getChildIndex(child);
  this.setChildIndex(child, actualIndex - 1);
};

Stage.prototype.getChildIndex = function (child) {
  return this._stage.getChildIndex(child.getSprite());
};

Stage.prototype.setChildIndex = function (child, index) {
  this._stage.setChildIndex(child.getSprite(), index);
};

Stage.prototype.showContextMenu = function (editorElement, menuItems, mouseDownEvent) {
  var canvasOffset = this._canvas.offset();
  var position = {
    top: mouseDownEvent.stageY + canvasOffset.top,
    left: mouseDownEvent.stageX + canvasOffset.left
  };

  var boundMenuItems = jQuery.extend(true, [], menuItems),
    queue = [];

  boundMenuItems.forEach(function (item) {
    queue.push(item);
  });

  while(queue.length) {
    var current;
    current = queue.shift();
    if(current.action) {
      current.action = current.action.bind(editorElement);
    }

    if(current.children) {
      queue.push.apply(queue, current.children);
    }
  }

  this._contextMenuPositioner.css(position);
  this._contextMenuPositioner.contextmenu('replaceMenu', boundMenuItems);
  setTimeout(function () {
    this._contextMenuPositioner.contextmenu('open', this._contextMenuPositioner);
  }.bind(this), 0);

};

Stage._dropHandler = function (event, ui) {
  var element = new EditorElement(ui.helper.eq(0).attr('src'), this);
  this.addChild(element);
  var position = ui.helper.posRelativeTo(this._canvas);

  element.setPosition({
    x: position.left,
    y: position.top
  });

  ui.helper.remove();
};

Stage._resizeHandler = function () {
  this.updateSize();
};

Stage._tickHandler = function () {
  this._stage.update();
};

$(document).ready(function () {
  $('li').draggable({
    helper: function () {
      var $img = $(this).find('img');
      var originalImage = $('<img />', {
        src: $img.data().original,
        'class': 'drag-helper'
      });

      return originalImage;
    }
  });

  var stage = new Stage($('#stage'));
  stage.updateSize();

  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
  createjs.Ticker.setFPS(60);
});
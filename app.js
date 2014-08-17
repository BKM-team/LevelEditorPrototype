'use strict';

var phantom;
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
    this.snapToGrid();
    this._sprite.alpha = 0.5;
    this._parentStage.moveChildToTop(this);
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

EditorElement.prototype.snapToGrid = function () {
  var gridSize = this._parentStage.getGridSize();
  this.setPosition({
    x: this.x - this.x%gridSize,
    y: this.y - this.y%gridSize
  });
};

var Stage = function ($canvas) {
  this._canvas = $canvas;

  this._canvas.on('contextmenu', function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
  });

  this._contextMenu = new ContextMenu();

  this._stage = new createjs.Stage(this._canvas.attr('id'));
  this._stage.enableMouseOver(10);

  var that = this;

  this._canvas.droppable({
    tolerance: 'fit',
    drop: Stage._dropHandler.bind(this),
    over: function (event, ui) {
      ui.helper.css('opacity', '0.5');
      ui.draggable.on('drag', function (event, ui) {
        var stagePos = $('#stage').position();
        var pos = ui.position;

        var left = pos.left - stagePos.left;
        var top = pos.top - stagePos.top;

        pos.top = top - top%that.getGridSize() + stagePos.top;
        pos.left = left - left%that.getGridSize() + stagePos.left;
        ui.helper.position(pos);
      });
    }
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

  this._contextMenu.show(editorElement, menuItems, position);
};

Stage.prototype.setGridSize = function (gridSize) {
  this._gridSize = gridSize;
};

Stage.prototype.getGridSize = function () {
  return this._gridSize;
};

Stage._dropHandler = function (event, ui) {
  var element = new EditorElement(ui.helper.eq(0).attr('src'), this);
  this.addChild(element);
  var position = ui.helper.posRelativeTo(this._canvas);

  element.setPosition({
    x: position.left,
    y: position.top
  });

  element.snapToGrid();

  ui.helper.remove();
  this._stage.removeChild(phantom);
};

Stage._resizeHandler = function () {
  this.updateSize();
};

Stage._tickHandler = function () {
  this._stage.update();
};

var ContextMenu = function () {
  this._positioner = $('<div />', {
    'class': 'contextMenuPositioner'
  }).appendTo(document.body);

  this._positioner.css({
    top: 0,
    left: 0
  });

  this._positioner.on('contextmenu', function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
  });

  this._positioner.contextmenu({
    menu: [],
    autoTrigger: false
  });
};

ContextMenu.prototype.show = function (editorElement, menuItems, position) {
  var boundMenuItems = this._bindActionsToEditorElement(editorElement, menuItems);
  this._displayMenu(boundMenuItems, position);
};

ContextMenu.prototype._bindActionsToEditorElement = function (editorElement, menuItems) {
  var boundMenuItems = jQuery.extend(true, [], menuItems),
    queue = [],
    currentMenuItem;

  boundMenuItems.forEach(function (item) {
    queue.push(item);
  });

  while(queue.length) {
    currentMenuItem = queue.shift();
    if(currentMenuItem.action) {
      currentMenuItem.action = currentMenuItem.action.bind(editorElement);
    }

    if(currentMenuItem.children) {
      queue.push.apply(queue, currentMenuItem.children);
    }
  }

  return boundMenuItems;
};

ContextMenu.prototype._displayMenu = function (boundMenuItems, position) {
  this._positioner.css(position);
  this._positioner.contextmenu('replaceMenu', boundMenuItems);
  setTimeout(function () {
    this._positioner.contextmenu('open', this._positioner);
  }.bind(this), 0);
};

var Editor = {
  assets: {
    _loadingQueue: new createjs.LoadQueue(true),
    _assetsList: {},
    _appendAssetToList: function (asset) {
      var key1, key2;
      if(asset.data && asset.data.type === "thumb") {
        key1 = asset.data.thumbFor;
        key2 = "thumb";
      } else {
        key1 = asset.id;
        key2 = "src";
      }

      if(!this._assetsList[key1]) {
        this._assetsList[key1] = {};
      }

      this._assetsList[key1][key2] = asset.src;
    },
    _renderLoadedAssets: function () {
      var ul = $('ul').eq(0);
      $.each(this._assetsList, function (key, asset) {
        var li = $('<li />', {
          html: $('<img />', {
            src: asset.thumb,
            'data-original': asset.src
          })
        }).appendTo(ul);
      });
    },
    _installEventsOnRenderedAssets: function () {
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
    },
    loadAssets: function (manifestFile) {
      this._loadingQueue.loadManifest(manifestFile);

      this._loadingQueue.on('fileload', (function (evt) {
        var item = evt.item;
        if(item.type === createjs.LoadQueue.IMAGE) {
          this._appendAssetToList(item);
        }
      }).bind(this));

      this._loadingQueue.on('complete', (function () {
        this._renderLoadedAssets();
        this._installEventsOnRenderedAssets();
        this._loadingQueue.removeAllEventListeners();
      }).bind(this));
    }
  }
};

$(document).ready(function () {
  Editor.assets.loadAssets('assets.json');

  var stage = new Stage($('#stage'));
  stage.setGridSize(20);
  stage.updateSize();

  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
  createjs.Ticker.setFPS(60);
});
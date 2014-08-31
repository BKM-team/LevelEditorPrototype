'use strict';

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

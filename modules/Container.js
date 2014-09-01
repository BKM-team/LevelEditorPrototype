'use strict';

var Container = function (parentStage) {
  this._parentStage = parentStage;
  this._container = new createjs.Container();
  this._parentStage.addChild(this._container);
  this._container.x = 0;
  this._container.y = 0;
};

Container.prototype.addChild = function (child) {
  this._container.addChild(child.getSprite());
};

Container.prototype.getChildIndex = function (child) {
  return this._container.getChildIndex(child.getSprite());
};

Container.prototype.setChildIndex = function (child, index) {
  this._container.setChildIndex(child.getSprite(), index);
};

Container.prototype.getChildCount = function () {
  return this._container.getNumChildren();
};

Container._mouseDownHandler = function () {

};

Container._mouseMoveHandler = function () {

};

Container._mouseUpHandler = function () {

};

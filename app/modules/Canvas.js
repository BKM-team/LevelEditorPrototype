'use strict';

var Canvas = function ($canvas) {
    this._$canvas = $canvas;
    this._$canvas.on('contextmenu', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
    });

    this._contextMenu = new ContextMenu();
    this.stage = new Stage(this._$canvas.get(0));

    this._$canvas.droppable({
        tolerance: 'fit',
        drop: this._dropHandler.bind(this),
        over: function (event, ui) {
            //TODO: use styling for this
            ui.helper.css('opacity', '0.5');
        }
    });

    $(window).on('resize', this._resizeHandler.bind(this));
};

Canvas.prototype.setSizeToParent = function () {
    var $canvasParent = this._$canvas.parent();
    var $canvasParentDimensions = {
        width: $canvasParent.width(),
        height: $canvasParent.height()
    };

    this._$canvas.attr('width', $canvasParentDimensions.width);
    this._$canvas.attr('height', $canvasParentDimensions.height);
};


//Canvas.prototype.showContextMenu = function (editorElement, menuItems, mouseDownEvent) {
//    var canvasOffset = this._$canvas.offset();
//    var position = {
//        top: mouseDownEvent.stageY + canvasOffset.top,
//        left: mouseDownEvent.stageX + canvasOffset.left
//    };
//
//    this._contextMenu.show(editorElement, menuItems, position);
//};

Canvas.prototype._dropHandler = function (event, ui) {
    var element = new EditorElement(ui.helper.eq(0).attr('src'), this.stage);
    var position = ui.helper.posRelativeTo(this._$canvas);

    this.stage.addChild(element, position);
    ui.helper.remove();
};

Canvas.prototype._resizeHandler = function () {
    this.setSizeToParent();
};

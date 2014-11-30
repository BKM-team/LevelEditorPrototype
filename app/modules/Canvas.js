'use strict';

var Canvas = function ($canvas, stageXTilesCount, stageYTilesCount, gridSize) {
    this._$canvas = $canvas;
    this._$canvas.on('contextmenu', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
    });

    this._$canvas.attr('width', stageXTilesCount * gridSize);
    this._$canvas.attr('height', stageYTilesCount * gridSize);

    this.stage = new Stage(this._$canvas.get(0), stageXTilesCount, stageYTilesCount, gridSize);

    this._$canvas.droppable({
        tolerance: 'fit',
        drop: this._dropHandler.bind(this),
        over: function (event, ui) {
            //TODO: use styling for this
            ui.helper.css('opacity', '0.5');
        }
    });
};

Canvas.prototype._dropHandler = function (event, ui) {
    var position = ui.helper.posRelativeTo(this._$canvas);

    this.stage.addChild(ui.helper.eq(0), position);
    ui.helper.remove();
};

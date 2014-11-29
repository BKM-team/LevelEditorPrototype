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

var Editor = {
    assetsList: new AssetsList(),
    layers: {
        _appendNewLayer: function ($ul, layer, index) {
            var $input = $('<input />', {
                type: 'checkbox',
                checked: layer.visible
            });

            $input.on('change', this._changeLayerVisibility.bind(this, $input, index));

            var $li = $('<li />', {
                'class': layer.active ? 'active' : ''
            });

            $li.append($input);

            var $label = $('<label />', {
                html: layer.name
            });
            $label.on('click', this._changeActiveLayer.bind(this, index));
            $li.append($label);

            if(!(layer.isFirst && layer.isLast)) {
                var $delete = $('<span />', {
                    html: '(x)'
                });
                $delete.on('click', this._deleteLayer.bind(this, index));
                $li.append($delete);
            }

            if(!layer.isFirst) {
                var $moveUp = $('<span />', {
                    html: '\u25B2'
                });
                $moveUp.on('click', this._moveLayerUp.bind(this, index));
                $li.append($moveUp);
            }

            if(!layer.isLast) {
                var $moveDown = $('<span />', {
                    html: '\u25BC'
                });
                $moveDown.on('click', this._moveLayerDown.bind(this, index));
                $li.append($moveDown);
            }

            var $layerType = $('<span />');
            switch(layer.type) {
                case Layer.TILE_LAYER:
                    $layerType.text(' (tile)');
                    break;

                case Layer.OBJECT_LAYER:
                    $layerType.text(' (object)');
                    break;
            }
            $li.append($layerType);

            $ul.append($li);
        },
        _changeActiveLayer: function (index) {
            Editor.stage.setActiveLayer(index);
            this.updateLayersList();

            var $assets = $('ul:eq(0)').children();

            switch (Editor.stage._getActiveLayerObject().getLayerType()) {
                case Layer.TILE_LAYER:
                    $assets.draggable('disable');
                    $assets.on('click', function () {
                        var $img = $(this).find('img');
                        Editor.stage.setImageForDrawing($img);
                    });
                    break;

                case Layer.OBJECT_LAYER:
                    $assets.off('click');
                    $assets.draggable('enable');
                    break;
            }
        },
        _changeLayerVisibility: function ($input, index) {
            var isVisible = $input.prop('checked');
            Editor.stage.changeLayerVisibility(index, isVisible);
            this.updateLayersList();
        },
        _deleteLayer: function (index) {
            Editor.stage.deleteLayer(index);
            this.updateLayersList();
        },
        _moveLayerUp: function (index) {
            Editor.stage.moveLayerUp(index);
            this.updateLayersList();
        },
        _moveLayerDown: function (index) {
            Editor.stage.moveLayerDown(index);
            this.updateLayersList();
        },
        updateLayersList: function () {
            var $ul = $('.right-panel .layers-list');
            $ul.empty();
            var layers = Editor.stage.getLayersList();
            layers.forEach(this._appendNewLayer.bind(this, $ul));
        },
        addNewLayer: function (name, type) {
            Editor.stage.addLayer(name, type);
            this.updateLayersList();
        },
        setActiveLayer: function (index) {
            this._changeActiveLayer(index);
        }
    },
    canvas: null,
    stage: null,
    serialization: {
        export: function () {
            var serializedStage = Editor.stage.toJSON();
            serializedStage.tilesets = Editor.assetsList.toJSON();

            return serializedStage;
        }
    }
};

$(document).ready(function () {
    Editor.assetsList.loadAssets('Platformer_In_The_Forest').then(function (assetsList) {
        $('.left-panel').append(assetsList);
        assetsList.children().draggable({
            helper: function () {
                return $(this).find('img').clone();
            },
            cursorAt: {
                top: 10,
                left: 10
            },
            appendTo: 'body',
            scroll: false
        });
        Editor.layers.setActiveLayer(0);
    });

    var canvas = new Canvas($('#main-canvas'), 40, 16, 32);
    Editor.canvas = canvas;
    Editor.stage = canvas.stage;

    $('.add-new-layer').on('click', function () {
        $('.add-layer-dialog').dialog('open');
    });

    $('.add-layer-dialog').dialog({
        autoOpen: false,
        modal: true,
        draggable: false,
        buttons: {
            'Add': function () {
                var $this = $(this);
                var layerName = $this.find('input').val();
                var layerType = parseInt($this.find('select').val(), 10);
                Editor.layers.addNewLayer(layerName, layerType);
                $this.find('form').get(0).reset();
                $this.dialog('close');
            }
        }
    });

    $('input[name="tool"]').on('change', function () {
        Editor.stage.setActiveTool(parseInt($(this).val(), 10));
    });

    Editor.layers.updateLayersList();
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.setFPS(60);
});

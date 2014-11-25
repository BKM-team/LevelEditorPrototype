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

            $ul.append($li);
        },
        _changeActiveLayer: function (index) {
            Editor.stage.setActiveLayer(index);
            this.updateLayersList();
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
        addNewLayer: function (name) {
            Editor.stage.addLayer(name);
            this.updateLayersList();
        },
        setActiveLayer: function (index) {
            Editor.stage.setActiveLayer(index);
            this.updateLayersList();
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
    });

    var canvas = new Canvas($('#main-canvas'));
    Editor.canvas = canvas;
    Editor.stage = canvas.stage;

    Editor.canvas.setSizeToParent();
    Editor.stage.setSize(20, 20);

    $('.add-new-layer').on('click', function () {
        var layerName = prompt('Type new layer name:');
        Editor.layers.addNewLayer(layerName);
    });

    Editor.layers.updateLayersList();

    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.setFPS(60);
});

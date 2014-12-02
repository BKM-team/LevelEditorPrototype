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
    SERVER_ADDR: 'http://localhost:3000/',
    init: function (xTilesCount, yTilesCount, gridSize) {
        var canvas = new Canvas($('#main-canvas'), xTilesCount, yTilesCount, gridSize);

        this.canvas = canvas;
        this.stage = canvas.stage;
        this.layers.updateLayersList();
    },
    assetsList: {
        _assetsList: new AssetsList(),
        loadAssets: function (tilesetName, tilesetImageData) {
            this._assetsList.loadAssetsFromTilesetImage(tilesetName, tilesetImageData);
            this._refreshAssetList();

            var $assets = $('.left-panel li.item');
            $assets.draggable({
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

            switch (Editor.layers.getActiveLayerType()) {
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
        _refreshAssetList: function () {
            $('.left-panel ul').remove();
            var $ul = this._assetsList.getTilesets().reduce(function ($ul, tileset) {
                var $li = $('<li />', {
                    'class': 'category'
                });
                var $childUl = tileset.tilesetImages.reduce(function ($ul, asset) {
                    var $frame = $(asset.image);
                    $frame.attr('data-frame-id', asset.frameId);

                    var $li = $('<li />', {
                        'class': 'item',
                        html: $frame
                    });

                    return $ul.append($li);
                }, $('<ul />'));

                $li.append($childUl);
                return $ul.append($li);
            }, $('<ul />'));

            $('.left-panel').append($ul);
        },
        toJSON: function () {
            return this._assetsList.toJSON();
        }
    },
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

            if (!(layer.isFirst && layer.isLast)) {
                var $delete = $('<span />', {
                    html: '(x)'
                });
                $delete.on('click', this._deleteLayer.bind(this, index));
                $li.append($delete);
            }

            if (!layer.isFirst) {
                var $moveUp = $('<span />', {
                    html: '\u25B2'
                });
                $moveUp.on('click', this._moveLayerUp.bind(this, index));
                $li.append($moveUp);
            }

            if (!layer.isLast) {
                var $moveDown = $('<span />', {
                    html: '\u25BC'
                });
                $moveDown.on('click', this._moveLayerDown.bind(this, index));
                $li.append($moveDown);
            }

            var $layerType = $('<span />');
            switch (layer.type) {
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

            var $assets = $('.left-panel li.item');

            switch (this.getActiveLayerType()) {
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
        },
        getActiveLayerType: function () {
            return Editor.stage._getActiveLayerObject().getLayerType();
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
    },
    elementProperties: {
        editProperties: function (name, type, properties) {
            return new Promise((function (resolve, reject) {
                var $dialog = $('.edit-properties-dialog');
                var $nameInput = $dialog.find('input[name="name"]');
                var $typeInput = $dialog.find('input[name="type"]');
                var that = this;

                $dialog.find('.add-new-property').hide();
                $nameInput.val(name);
                $typeInput.val(type);

                this._renderProperties(properties);

                $dialog.find('.ui-dialog-titlebar-close').on('click', function () {
                    reject();
                });

                $dialog.find('.edit-properties-save-properties').one('click', function () {
                    resolve({
                        name: $nameInput.val(),
                        type: $typeInput.val(),
                        properties: that._serializeForm()
                    });
                });

                $dialog.find('.edit-properties-add-new-property').one('click', function () {
                    that._addNewProperty();
                });

                $dialog.find('.edit-properties-save-properties').one('click', function () {
                   $dialog.dialog('close');
                });

                $dialog.dialog('open');
            }).bind(this));
        },
        _addNewProperty: function () {
            var that = this;

            var $dialog = $('.edit-properties-dialog');
            $dialog.find('.edit-properties').hide();
            $dialog.find('.add-new-property').show();

            $dialog.find('.add-new-property-save-property').one('click', function () {
                var propertyName = $dialog.find('.add-new-property input[name="name"]').val();
                var propertyValue = $dialog.find('.add-new-property input[name="value"]').val();

                var $li = $('<li />');
                var $label = $('<label />', {
                    html: propertyName + ': '
                });

                var $input = $('<input />', {
                    type: 'text',
                    name: propertyName,
                    value: propertyValue
                });

                $li.append($label, $input).appendTo($('.edit-properties-property-list ul'));
                $dialog.find('.edit-properties').show();
                $dialog.find('.add-new-property').hide().get(0).reset();
                $dialog.find('.edit-properties-add-new-property').one('click', function () {
                    that._addNewProperty();
                });
            });
        },
        _renderProperties: function (properties) {
            var $ul = $('.edit-properties-property-list ul');
            $ul.empty();

            $.each(properties, function (propertyName, propertyValue) {
                var $li = $('<li />');
                var $label = $('<label />', {
                    html: propertyName + ': '
                });

                var $input = $('<input />', {
                    type: 'text',
                    name: propertyName,
                    value: propertyValue
                });

                $li.append($label, $input).appendTo($ul);
            });
        },
        _serializeForm: function () {
            return $('.edit-properties-dialog li')
                .toArray()
                .reduce(function (properties, li) {
                    var $input = $(li).find('input');
                    properties[$input.attr('name')] = $input.val();
                    return properties;
                }, {});
        }
    }
};

$(document).ready(function () {
    $('.set-map-size-dialog').dialog({
        autoOpen: true,
        modal: true,
        draggable: false
    });

    $('.set-map-size-dialog-set-size').on('click', function () {
        var dialog = $('.set-map-size-dialog');
        function isInt(x) {
            return x === (x|0);
        }

        var xTilesCount = Number(dialog.find('input[name="x-tiles-count"]').val());
        var yTilesCount = Number(dialog.find('input[name="y-tiles-count"]').val());

        if(!isInt(xTilesCount) || xTilesCount <= 0 || !isInt(yTilesCount) || yTilesCount <= 0) {
            dialog.find('.error').show();
            return;
        }

        dialog.find('.loading').show();
        setTimeout(function () {
            Editor.init(xTilesCount, yTilesCount, 32);
            dialog.dialog('close');
        }, 0);
    });

    $('.set-map-size-dialog input').on('focus', function () {
        $('.set-map-size-dialog .error').hide();
    });

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

    $('.edit-properties-dialog').dialog({
        autoOpen: false,
        modal: true,
        draggable: false
    });

    $('input[name="tool"]').on('change', function () {
        Editor.stage.setActiveTool(parseInt($(this).val(), 10));
    });

    $('.add-tileset-dialog').dialog({
        autoOpen: false,
        modal: true,
        draggable: false
    });

    $('.add-new-tileset').on('click', function () {
        $('.add-tileset-dialog').dialog('open');
    });

    $('.add-tileset input[name="tileset"]').on('change', function () {
        var tilesetFile = this.files[0];
        if(tilesetFile) {
            $('.add-tileset input[name="name"]').val(tilesetFile.name.split('.')[0]);
        }
    });

    $('.add-tileset-save-new-tileset').on('click', function () {
        var $dialog = $('.add-tileset-dialog');
        var tilesetFile = $dialog.find('input[name="tileset"]').get(0).files[0];
        var tilesetName = $dialog.find('input[name="name"]').val();

        if(!tilesetFile) {
            $dialog.dialog('close');
        } else {
            var reader = new FileReader();
            reader.addEventListener('load', function () {
                //TODO: allow only image files
                var imageData = reader.result;
                Editor.assetsList.loadAssets(tilesetName, imageData);
                $dialog.find('form').get(0).reset();
                $dialog.dialog('close');
            });

            reader.readAsDataURL(tilesetFile);
        }
    });

    $('.right-panel .export-map').on('click', function () {
        var serializedData = Editor.serialization.export();
        $.post(Editor.SERVER_ADDR + 'levels', serializedData);
    });

    $('.right-panel .player-sprite button').click(function () {
        var form = $('.right-panel .player-sprite').get(0);
        var formData = new FormData(form);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', Editor.SERVER_ADDR + 'assets/player', true);
        xhr.onload = function(e) { };
        xhr.send(formData);
    });

    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.setFPS(60);
});

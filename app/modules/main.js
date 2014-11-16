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
    assets: {
        _loadingQueue: new createjs.LoadQueue(true),
        _assetsList: {},
        _appendAssetToList: function (asset) {
            var category = asset.id.split('/')[0];
            if (!this._assetsList[category]) {
                this._assetsList[category] = [];
            }

            this._assetsList[category].push(asset.src);
        },
        _renderLoadedAssets: function () {
            var ul = $('ul').eq(0);
            $.each(this._assetsList, function (categoryName, category) {
                var li = $('<li />', {
                    'class': 'category',
                    html: categoryName
                });

                var catUl = $('<ul />');
                li.append(catUl);
                category.forEach(function (item) {
                    var li = $('<li />', {
                        'class': 'item',
                        html: $('<img />', {
                            src: item
                        })
                    });

                    catUl.append(li);
                });

                ul.append(li);
            });
        },
        _installEventsOnRenderedAssets: function () {
            $('li.item').draggable({
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
        },
        prepareManifest: function (assets) {
            var manifest = [];

            function readArrayRecursively(arr) {
                arr.forEach(function (item) {
                    if (item.contents) {
                        readArrayRecursively(item.contents);
                    } else {
                        manifest.push(item);
                    }
                });
            }

            readArrayRecursively(assets);

            return manifest;
        },
        loadAssets: function (assetsFile) {
            $.ajax(assetsFile)
                .done((function (response) {
                    var manifest = this.prepareManifest(response.assets);
                    this._loadingQueue.loadManifest({
                        manifest: manifest,
                        path: response.path
                    });
                }).bind(this));

            this._loadingQueue.on('fileload', (function (evt) {
                var item = evt.item;
                if (item.type === createjs.LoadQueue.IMAGE) {
                    this._appendAssetToList(item);
                }
            }).bind(this));

            this._loadingQueue.on('complete', (function () {
                this._renderLoadedAssets();
                this._installEventsOnRenderedAssets();
                this._loadingQueue.removeAllEventListeners();
            }).bind(this));
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

            if(!layer.isFirst) {
                var $delete = $('<span />', {
                    html: '(x)'
                });
                $delete.on('click', this._deleteLayer.bind(this, index));
                $li.append($delete);

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
    stage: null
};

$(document).ready(function () {
    Editor.assets.loadAssets('assets/assets.json');

    var canvas = new Canvas($('#main-canvas'));
    Editor.canvas = canvas;
    Editor.stage = canvas.stage;

    Editor.canvas.setSizeToParent();
    Editor.stage.setSize(20, 20);

    $('button.settings').on('click', function () {
        setNewCanvasDimensions();
    });

    $('.add-new-layer').on('click', function () {
        var layerName = prompt('Type new layer name:');
        Editor.layers.addNewLayer(layerName);
    });

    Editor.layers.updateLayersList();

    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.setFPS(60);
});

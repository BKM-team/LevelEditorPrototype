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

            if(index === 0) {
                $ul.append($li);
                return;
            }

            var $delete = $('<span />', {
                html: '(x)'
            });
            $delete.on('click', this._deleteLayer.bind(this, index));
            $li.append($delete);

            $ul.append($li);
        },
        _changeActiveLayer: function (index) {
            stage.setActiveLayer(index);
            this.updateLayersList();
        },
        _changeLayerVisibility: function ($input, index) {
            var isVisible = $input.prop('checked');
            stage.changeLayerVisibility(index, isVisible);
            this.updateLayersList();
        },
        _deleteLayer: function (index) {
            stage.deleteLayer(index);
            this.updateLayersList();
        },
        updateLayersList: function () {
            var $ul = $('.right-panel .layers-list');
            $ul.empty();
            var layers = stage.getLayersList();
            layers.forEach(this._appendNewLayer.bind(this, $ul));
        },
        addNewLayer: function (name) {
            stage.addLayer(name);
            this.updateLayersList();
        },
        setActiveLayer: function (index) {
            stage.setActiveLayer(index);
            this.updateLayersList();
        }
    }
};

$(document).ready(function () {
    Editor.assets.loadAssets('assets/assets.json');

    var stage = new Stage($('#stage'));
    window.stage = stage;
    stage.setGridSize(32);
    stage.setSizeToParent();

    function setNewCanvasDimensions() {
        var actualDimensions = stage.getEditorCanvasSize();
        var newDimensions = prompt('TEMPORARY: set new dimensions for canvas (please input in this format: width,height): ', actualDimensions.width + ',' + actualDimensions.height);
        if (!newDimensions.match(/\d+,\d+/)) {
            alert('Oh, look, what a rebel!');
            return;
        }

        var width = newDimensions.split(',')[0],
            height = newDimensions.split(',')[1];

        stage.setEditorCanvasSize(width, height);
    }

    function setNewGridSize() {
        var actualGridSize = stage.getGridSize();
        var newGridSize = parseInt(prompt('TEMPORARY: set new grid size', actualGridSize), 10);
        if (!newGridSize) {
            alert('Whataya tryin to do, dude?');
            return;
        }

        stage.setGridSize(newGridSize);
        //stage.updateGrid();
    }

    $('button.settings').on('click', function () {
        setNewCanvasDimensions();
        //setNewGridSize();
    });

    $('.add-new-layer').on('click', function () {
        var layerName = prompt('Type new layer name:');
        Editor.layers.addNewLayer(layerName);
    });

    stage.drawGrid();
    Editor.layers.updateLayersList();

    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.setFPS(60);
});

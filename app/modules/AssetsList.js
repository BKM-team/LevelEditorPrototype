'use strict';

var AssetsList = function () {
};

AssetsList._PATH = 'assets/processed/';

AssetsList.prototype.loadAssets = function (tileMapName) {
    var tileMapImageFile = AssetsList._PATH + tileMapName + '_tilemap.png';
    var tileMapMetaFile = AssetsList._PATH + tileMapName + '_assets.json';

    return new Promise((function (resolve) {
        var img = $('<img />').attr('src', tileMapImageFile)
            .load((function () {
                this._tileMapImage = img.get(0);
                resolve();
            }).bind(this));
    }).bind(this))
        .then(function () {
            return $.ajax(tileMapMetaFile).promise();
        })
        .then((function (tileMapMeta) {
            this._assets = tileMapMeta.assets;

            var animationsAndFrames = this._createAnimationsAndFrames(tileMapMeta.size);
            this._spritesheet = new createjs.SpriteSheet({
                images: [this._tileMapImage],
                frames: animationsAndFrames.frames,
                animations: animationsAndFrames.animations
            });

            return this._createAssetsListElement();
        }).bind(this));
};

AssetsList.prototype._createAnimationsAndFrames = function (size) {
    function Frame(x, y) {
        return [x, y, size, size];
    }

    var frames = [];
    var animations = {};

    this._assets.forEach(function (asset, frameId) {
        var frame = new Frame(asset.coords.x, asset.coords.y);
        frames.push(frame);

        animations[asset.id] = [frameId];
    });

    return {
        animations: animations,
        frames: frames
    };
};

AssetsList.prototype._createAssetsListElement = function () {
    var $ul = $('<ul />');

    this._assets.forEach(function (asset, frameId) {
        var $frame = $(createjs.SpriteSheetUtils.extractFrame(this._spritesheet, asset.id));
        $frame.attr('data-frame-id', frameId);

        var $li = $('<li />', {
            'class': 'item',
            html: $frame
        });

        $ul.append($li);
    }, this);

    AssetsList._installEventsOnAssetsListElement($ul);
    return $ul;
};

AssetsList._installEventsOnAssetsListElement = function ($ul) {
    $ul.children().draggable({
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
};

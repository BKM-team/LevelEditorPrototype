'use strict';

var Tileset = function (tilesetImageFile, tilesetImage, tilesetMeta) {
    this._imageFile = tilesetImageFile;
    this._assets = tilesetMeta.assets;
    this._tileSize = tilesetMeta.size;
    this._image = tilesetImage;

    var animationsAndFrames = this._createAnimationsAndFrames();
    this._spritesheet = new createjs.SpriteSheet({
        images: [this._image],
        frames: animationsAndFrames.frames,
        animations: animationsAndFrames.animations
    });
};

Tileset.create = function (tilesetPath) {
    var tilesetImageFile = tilesetPath + '_tileset.png';
    var tilesetMetaFile = tilesetPath + '_meta.json';

    var imageLoadPromise = new Promise(function (resolve) {
        var img = $('<img />').attr('src', tilesetImageFile)
            .load(function () {
                resolve(img.get(0));
            });
    });

    return Promise.join(imageLoadPromise, $.ajax(tilesetMetaFile).promise(), function (tilesetImage, tilesetMeta) {
        return new Tileset(tilesetImageFile, tilesetImage, tilesetMeta);
    });
};

Tileset.prototype._getAssetGID = function (asset) {
    var GID_OFFSET = 1;
    var assetColumn = asset.coords.x / this._tileSize;
    var assetRow = asset.coords.y / this._tileSize;
    return GID_OFFSET + assetColumn + assetRow * this._image.width / this._tileSize;
};

Tileset.prototype._createAnimationsAndFrames = function () {
    var tileSize = this._tileSize;

    function Frame(x, y) {
        return [x, y, tileSize, tileSize];
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

Tileset.prototype.getLength = function () {
    return this._assets.length;
};

Tileset.prototype.getImageSize = function () {
    return {
        width: this._image.width,
        height: this._image.height
    };
};

Tileset.prototype.getImageFile = function () {
    return this._imageFile;
};

Tileset.prototype.getTileSize = function () {
    return this._tileSize;
};

Tileset.prototype.toHTML = function () {
    //unlike other similar functions from Array.prototype, reduce doesn't have a thisArg
    //why, TC39?
    var that = this;

    return this._assets.reduce(function ($collection, asset) {
        var $frame = $(createjs.SpriteSheetUtils.extractFrame(that._spritesheet, asset.id));
        $frame.attr('data-frame-id', that._getAssetGID(asset));

        var $li = $('<li />', {
            'class': 'item',
            html: $frame
        });

        return $collection.add($li);
    }, $());
};

Tileset.prototype.toJSON = function () {
    return {
        image: this.getImageFile(),
        imagewidth: this.getImageSize().width,
        imageheight: this.getImageSize().height,
        tileheight: this.getTileSize(),
        tilewidth :this.getTileSize(),
        //TODO: make tilesets more customizable
        properties: {},
        margin: 0,
        spacing: 0
    };
};

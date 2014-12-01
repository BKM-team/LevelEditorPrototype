'use strict';

var Tileset = function (tilesetImage) {
    var generatedTilesetMeta = Tileset._generateMeta(tilesetImage);

    this._assets = generatedTilesetMeta.assets;
    this._tileSize = generatedTilesetMeta.tileSize;
    this._image = tilesetImage;

    var animationsAndFrames = this._createAnimationsAndFrames();
    this._spritesheet = new createjs.SpriteSheet({
        images: [this._image],
        frames: animationsAndFrames.frames,
        animations: animationsAndFrames.animations
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

Tileset.prototype.getImageData = function () {
    return this._image.src;
};

Tileset.prototype.getTileSize = function () {
    return this._tileSize;
};

Tileset._generateMeta = function (image) {
    function guessTileSize(image) {
        var multiplier = 2;
        for(; multiplier <= image.width || multiplier <= image.height; multiplier *= 2) {
            if(image.width % multiplier !== 0 || image.height & multiplier !== 0) {
                return multiplier / 2;
            }
        }
    }

    //TODO: use above function when finally we allow other tileset sizes
    var tileSize = 32;
    var assets = [];

    for (var y = 0; y < image.height; y += tileSize) {
        for (var x = 0; x < image.width; x += tileSize) {
            assets.push({
                id: y + '_' + x,
                coords: {
                    x: x,
                    y: y
                }
            });
        }
    }

    return {
        assets: assets,
        tileSize: tileSize
    };
};

Tileset.prototype.getTilesetImagesData = function () {
  return this._assets.map(function (asset) {
      return {
          image: createjs.SpriteSheetUtils.extractFrame(this._spritesheet, asset.id),
          frameId: this._getAssetGID(asset)
      };
  }, this);
};

Tileset.prototype.toJSON = function () {
    return {
        //this will be replaced by a path to image created from the image data
        //server needs to handle this task
        image: this.getImageData(),
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

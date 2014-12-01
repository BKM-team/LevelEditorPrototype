'use strict';

var AssetsList = function () {
    this._tilesets = [];
    this._lastGID = 0;
};

AssetsList.prototype.loadAssetsFromTilesetImage = function (tilesetName, tilesetImageData) {
    var tilesetImage = new Image();
    tilesetImage.src = tilesetImageData;

    var tileset = new Tileset(tilesetImage);
    this._tilesets.push({
        name: tilesetName,
        firstGID: this._lastGID + 1,
        tilesetData: tileset
    });

    this._lastGID += tileset.getLength();
};

AssetsList.prototype.getTilesets = function () {
    return this._tilesets.map(function (tileset) {
        return {
            name: tileset.name,
            tilesetImages: tileset.tilesetData.getTilesetImagesData()
        };
    });
};

AssetsList.prototype.toJSON = function () {
    return this._tilesets.map(function (tileset) {
        var serializedTileset = tileset.tilesetData.toJSON();
        serializedTileset.firstgid = tileset.firstGID;
        serializedTileset.name = tileset.name;

        return serializedTileset;
    });
};

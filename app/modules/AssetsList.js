'use strict';

var AssetsList = function () {
    this._tilesets = [];
    this._lastGID = 0;
};

AssetsList._PATH = 'assets/processed/';

AssetsList.prototype.loadAssets = function (tilesetName) {
    return Tileset.create(AssetsList._PATH + tilesetName)
        .then((function (tileset) {
            tileset._assetsListMeta = {
                name: tilesetName,
                firstGID: this._lastGID + 1
            };

            this._tilesets.push(tileset);
            this._lastGID += tileset.getLength();
            return this.toHTML();
        }).bind(this));
};

AssetsList.prototype.toHTML = function () {
    var $ul = this._tilesets.reduce(function ($collection, tileset) {
        return $collection.append(tileset.toHTML());
    }, $('<ul />'));

    AssetsList._installEventsOnAssetsListElement($ul);

    return $ul;
};

AssetsList.prototype.toJSON = function () {
    return this._tilesets.map(function (tileset) {
        var serializedTileset = tileset.toJSON();
        serializedTileset.firstgid = tileset._assetsListMeta.firstGID;
        serializedTileset.name = tileset._assetsListMeta.name;

        return serializedTileset;
    });
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

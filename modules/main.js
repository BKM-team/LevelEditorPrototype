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
      var key1, key2;
      if(asset.data && asset.data.type === "thumb") {
        key1 = asset.data.thumbFor;
        key2 = "thumb";
      } else {
        key1 = asset.id;
        key2 = "src";
      }

      if(!this._assetsList[key1]) {
        this._assetsList[key1] = {};
      }

      this._assetsList[key1][key2] = asset.src;
    },
    _renderLoadedAssets: function () {
      var ul = $('ul').eq(0);
      $.each(this._assetsList, function (key, asset) {
        var li = $('<li />', {
          html: $('<img />', {
            src: asset.thumb,
            'data-original': asset.src
          })
        }).appendTo(ul);
      });
    },
    _installEventsOnRenderedAssets: function () {
      $('li').draggable({
        helper: function () {
          var $img = $(this).find('img');
          var originalImage = $('<img />', {
            src: $img.data().original,
            'class': 'drag-helper'
          });

          return originalImage;
        }
      });
    },
    loadAssets: function (manifestFile) {
      this._loadingQueue.loadManifest(manifestFile);

      this._loadingQueue.on('fileload', (function (evt) {
        var item = evt.item;
        if(item.type === createjs.LoadQueue.IMAGE) {
          this._appendAssetToList(item);
        }
      }).bind(this));

      this._loadingQueue.on('complete', (function () {
        this._renderLoadedAssets();
        this._installEventsOnRenderedAssets();
        this._loadingQueue.removeAllEventListeners();
      }).bind(this));
    }
  }
};

$(document).ready(function () {
  Editor.assets.loadAssets('assets.json');

  var stage = new Stage($('#stage'));
  stage.setSizeToParent();

  $('button.settings').on('click', function () {
    var actualDimensions = stage.getContainerSize();
    var newDimensions = prompt('TEMPORARY: set new dimensions for canvas (please input in this format: width,height): ', actualDimensions.width + ',' + actualDimensions.height);
    if(!newDimensions.match(/\d+,\d+/)) {
      alert('Oh, look, what a rebel!');
      return;
    }

    var width = newDimensions.split(',')[0],
      height = newDimensions.split(',')[1];

    stage.setContainerSize(width, height);
  });

  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
  createjs.Ticker.setFPS(60);
});

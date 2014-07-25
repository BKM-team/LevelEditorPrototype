$(document).ready(function () {

  var EditorElement = function (imageSrc) {
    var texture = PIXI.Texture.fromImage(imageSrc);
    this._pixiSprite = new PIXI.Sprite(texture);

    this._pixiSprite.anchor.x = 0.5;
    this._pixiSprite.anchor.y = 0.5;
    this._pixiSprite.interactive = true;
    this._pixiSprite.buttonMode = true;

    this._pixiSprite.mousedown = EditorElement._mouseDownHandler.bind(this);
    this._pixiSprite.mouseup = EditorElement._mouseUpHandler.bind(this);

    stage.addChild(this._pixiSprite);
  };

  EditorElement._mouseDownHandler = function (data) {
    this._dragging = true;
    this._pixiSprite.data = data;

    var localPosition = this._pixiSprite.data.getLocalPosition(this._pixiSprite);

    this._sx = localPosition.x;
    this._sy = localPosition.y;

    this._pixiSprite.mousemove = EditorElement._mouseMoveHandler.bind(this);
  };

  EditorElement._mouseMoveHandler = function () {
    if(this._dragging)
    {
      var newPosition = this._pixiSprite.data.getLocalPosition(this._pixiSprite.parent);
      this._pixiSprite.position.x = newPosition.x - this._sx;
      this._pixiSprite.position.y = newPosition.y - this._sy;
    }
  };

  EditorElement._mouseUpHandler = function () {
    this._dragging = false;
    this._pixiSprite.data = null;
    delete this._pixiSprite.mousemove;
  };

  EditorElement.prototype.setPosition = function (position) {
    this._pixiSprite.position.x = position.x;
    this._pixiSprite.position.y = position.y;
  }

  $('li').draggable({
    helper: function () {
      var $img = $(this).find('img');
      var originalImage = $('<img />', {
        src: $img.data().original
      });

      return originalImage;
    }
  });

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

  $('canvas').droppable({
    tolerance: 'fit',
    drop: function (event, ui) {
      var element = new EditorElement(ui.helper.eq(0).attr('src'));
      var position = ui.helper.posRelativeTo($('canvas'));

      element.setPosition({
        x: position.left + ui.helper.width()/2,
        y: position.top + ui.helper.height()/2
      });

      ui.helper.remove();
    }
  });


  var stage = new PIXI.Stage();
  var renderer = PIXI.autoDetectRenderer($('.right-panel').width(), $('.right-panel').height(), $('canvas').get(0));

  function animate() {
    requestAnimFrame( animate );
    renderer.render(stage);
  }

  requestAnimFrame(animate);
});
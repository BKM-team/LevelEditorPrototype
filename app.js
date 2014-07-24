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

  $('li img').draggable({
    helper: function () {
      var $this = $(this);
      var originalImage = $('<img />', {
        src: $this.data().original
      });

      return originalImage;
    }
  });

  $.fn.posRelativeTo = function (element) {
    var o1 = this.offset();
    var o2 = element.offset();
    var dx = o1.left - o2.left;
    var dy = o1.top - o2.top;
    return {
      top: dy,
      left: dx
    };
  };

  $('canvas').droppable({
    accept: 'img',
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

  $('canvas').attr('width', $('.right-panel').width())
    .attr('height', $('.right-panel').height());

  var stage = new PIXI.Stage();
  var renderer = PIXI.autoDetectRenderer($('.right-panel').width(), $('.right-panel').height(), $('canvas').get(0));

  function animate() {
    requestAnimFrame( animate );
    renderer.render(stage);
  }

  requestAnimFrame(animate);
});
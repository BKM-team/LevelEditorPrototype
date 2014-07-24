$(document).ready(function () {


  $('li img').draggable({
    helper: function () {
      var $this = $(this);
      var originalImage = $('<img />', {
        src: $this.data().original
      });

      return originalImage;
    }
  });

  var getRelativePosition = function ($element1, $element2) {
    var o1 = $element1.offset();
    var o2 = $element2.offset();
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
      var texture = PIXI.Texture.fromImage(ui.helper.eq(0).attr('src'));
      var element = new PIXI.Sprite(texture);
      element.interactive = true;
      element.buttonMode = true;

      element.anchor.x = 0.5;
      element.anchor.y = 0.5;

      element.mousedown = function (data) {
        this.dragging = true;
        //this.data = data;
      };

      element.mouseup = function () {
        this.dragging = false;
      };

      element.mousemove = function(data)
      {
        if(this.dragging)
        {
          var newPosition = data.getLocalPosition(this.parent);
          this.position.x = newPosition.x;
          this.position.y = newPosition.y;
        }
      };

      var position = getRelativePosition(ui.helper, $('canvas'));
      element.position.x = position.left + ui.helper.width()/2;
      element.position.y = position.top + ui.helper.height()/2;

      ui.helper.remove();
      stage.addChild(element);
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
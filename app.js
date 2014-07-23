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
      var element = new createjs.Bitmap(ui.helper.get(0));
      stage.addChild(element);
      var position = getRelativePosition(ui.helper, $('canvas'));
      element.x = position.left;
      element.y = position.top;
      stage.update();
      ui.helper.remove();
    }
  });

  $('canvas').attr('width', $('.right-panel').width())
    .attr('height', $('.right-panel').height());

  var stage = new createjs.Stage('stage');
});
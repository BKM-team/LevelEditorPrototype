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
});
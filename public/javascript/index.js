$("#requestForm").submit(function(e){
  e.preventDefault();
  console.log("hihi");
  var that = $(this),
      url = that.attr('action'),
      type = that.attr('method'),
      data = {};

      that.find('[id]').each(function(index, value){
        var that = $(this);
            name = that.attr('id');
            value = that.val();

          data[name] = value;
      });

      $.ajax({
          url: url,
          type: type,
          data: data,
          success: function(data){
            console.log(data);
          }
      });
      window.location = "/requests";
return false;
});

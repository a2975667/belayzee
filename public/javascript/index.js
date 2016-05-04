/*
 * index.js takes cares of the form submission for user proposing a new request
 * created by tcheng
*/
$("#requestForm").submit(function(e){
  e.preventDefault();
  var that = $(this),
      url = that.attr('action'),
      type = that.attr('method'),
      data = {};
      //appends the information in the form with the id of the html
      that.find('[id]').each(function(index, value){
        var that = $(this);
            name = that.attr('id');
            value = that.val();

          data[name] = value;
      });
      //jquery ajax data to server-side
      $.ajax({
          url: url,
          type: type,
          data: data,
          success: function(data){
            //console.log(data);
          }
      });
      //console.log(data);
      //timeout 1 sec and reload to request page after submission
      setTimeout(function() {
          window.location = "/requests";
      }, 1000);

return false;
});

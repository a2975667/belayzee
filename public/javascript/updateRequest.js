/*
 * updateRequest.js takes cares updateing the request by a user
 * created by tcheng
*/
$("#requestForm").submit(function(e){
  e.preventDefault();
  var that = $(this),
      url = that.attr('action'),
      type = that.attr('method'),
      data = {};
      //collect data from each input field by key value pair
      that.find('[id]').each(function(index, value){
        var that = $(this);
            name = that.attr('id');
            value = that.val();

          data[name] = value;
      });

      //perform ajax
      $.ajax({
          url: "/update/request/"+ getRequestId(),
          type: type,
          data: data,
          error: function(xhr) {
              $("#message").text(xhr.statusText);
              console.log(xhr.statusText);
          },
          success: function(result) {
            console.log("ok");
          }
      });
      console.log(data);
      setTimeout(function() {
          window.location = "/requests";
      }, 1000);
return false;
});

//get the id of the request
function getRequestId() {
    return window.location.href.split('/')[window.location.href.split('/').length-1] ;
}

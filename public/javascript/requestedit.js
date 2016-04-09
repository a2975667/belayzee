$(document).ready(function() {
  $("#delete").click(function() {
    if ($("#status").text()=="Login"){
      window.location = "/login";
    }else{
      if(confirm('Delete Request?')){
        console.log("delete");
        var data = {};
        data["requestId"] = getRequestId();
        //data["name"] = $("#rname").text();
        //var requestId = getRequestId();
        $.ajax({
            type: "POST",
            url: "/deleteRequest",
            data: data,
            error: function(xhr) {
                $("#message").text(xhr.statusText);
                console.log(xhr.statusText);
            },
            success: function(result) {
              console.log("ok");
            }
        });
        window.location = "/requests"
      }

      /*var data = {};
      data["requestId"] = getRequestId();
      data["name"] = $("#rname").text();
      //var requestId = getRequestId();
      $.ajax({
          type: "POST",
          url: "/reply",
          data: data,
          error: function(xhr) {
              $("#message").text(xhr.statusText);
              console.log(xhr.statusText);
          },
          success: function(result) {
            console.log("ok");
          }
      });
      window.location = "/"*/
    }
  });

});

function getRequestId() {
    return window.location.href.split('/')[window.location.href.split('/').length-1] ;
}

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
    }
  });

  $("#updateform").click(function() {
    if ($("#status").text()=="Login"){
      window.location = "/login";
    }else{
      window.location = "/update/request/"+ getRequestId();
        /*console.log("update");
        var data = {};
        data["requestId"] = getRequestId();
        console.log(data);
        $.ajax({
            type: "POST",
            url: "/update/request",
            data: data,
            error: function(xhr) {
                $("#message").text(xhr.statusText);
                console.log(xhr.statusText);
            },
            success: function(result) {
              console.log("ok");
              console.log(result.requestId)
            }
        });*/
    }
  });

});

function getRequestId() {
    return window.location.href.split('/')[window.location.href.split('/').length-1] ;
}

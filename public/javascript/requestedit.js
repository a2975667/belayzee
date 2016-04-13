$(document).ready(function() {
  $(".replieUser").click(function() {
    if ($("#status").text()=="Login"){
      window.location = "/login";
    }else{
      var uid =  $(this).attr("value");
      var uname = $(this).attr("value2");
      var msg = "select " + uname + " ?";
      console.log();
      if(confirm(msg)){
        var data = {};
        data["requestId"] = getRequestId();
        data["userId"] = uid;
        data["username"] = uname;
        $.ajax({
            type: "POST",
            url: "/confirmtask",
            data: data,
            error: function(xhr) {
                $("#message").text(xhr.statusText);
                console.log(xhr.statusText);
            },
            success: function(result) {
              console.log("ok");
            }
        });
        setTimeout(function() {
            window.location = "/requests/"+getRequestId();
        }, 1000);
        
      }
    }
  });

  $("#done").click(function() {
    var uid =  $(this).attr("value");
    if ($("#status").text()=="Login"){
      window.location = "/login";
    }else{
      if(confirm('Request Complete?')){
        console.log("delete");
        var data = {};
        data["requestId"] = getRequestId();
        data["userId"] = uid;
        $.ajax({
            type: "POST",
            url: "/completeRequest",
            data: data,
            error: function(xhr) {
                $("#message").text(xhr.statusText);
                console.log(xhr.statusText);
            },
            success: function(result) {
              console.log("ok");
            }
        });
        setTimeout(function() {
            window.location = "/requests"
        }, 1000);

      }
    }
  });

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

        setTimeout(function() {
            window.location = "/requests"
        }, 1000);
      }
    }
  });

  $("#updateform").click(function() {
    if ($("#status").text()=="Login"){
      setTimeout(function() {
          window.location = "/login";
      }, 1000);

    }else{
      setTimeout(function() {
          window.location = "/update/request/"+ getRequestId();
      }, 1000);

    }
  });

});

function getRequestId() {
    return window.location.href.split('/')[window.location.href.split('/').length-1] ;
}

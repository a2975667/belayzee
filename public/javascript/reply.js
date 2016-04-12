$(document).ready(function() {
    $("#reply").click(function() {
      if ($("#status").text()=="Login"){
        window.location = "/login";

      }else{
        console.log("reply");
        var data = {};
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
        setTimeout(function () {
   location.reload(); //will redirect to your blog page (an ex: blog.html)
}, 1000);

      }
    });

    $("#replied").click(function() {
        console.log("cancel reply");
        var data = {};
        data["requestId"] = getRequestId();
        data["name"] = $("#rname").text();
        $.ajax({
            type: "POST",
            url: "/replied",
            data: data,
            error: function(xhr) {
                $("#message").text(xhr.statusText);
                console.log(xhr.statusText);
            },
            success: function(result) {
              console.log("ok");
            }
        });
        setTimeout(function () {
   location.reload(); //will redirect to your blog page (an ex: blog.html)
}, 1000);
    });

    return false;
});

function getRequestId() {
    return window.location.href.split('/')[window.location.href.split('/').length-1] ;
}

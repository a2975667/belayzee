/*
 * reply.js takes cares of the form submission for user proposing a new request
 * created by tcheng
 * reply.js handles all actions for a user viewing a specific request by another user
*/
$(document).ready(function() {
    // when the user hit the reply buttom to reply to a specific request
    $("#reply").click(function() {
        //check if the user is logged in, otherwise redirect to login page
        if ($("#status").text() == "Login") {
            window.location = "/login";
        } else {
            //proceed a ajax request to serverside for updating user replied to
            //this specific request
            var data = {};
            data["requestId"] = getRequestId();
            data["name"] = $("#rname").text();
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
            setTimeout(function() {
                location.reload();
            }, 1000);

        }
    });

    //if the user has already replied to the request, a replied buttom would
    //appear instead of reply, handled by the ejs file. the following is what
    //clicking on replied would trigger
    $("#replied").click(function() {
        var data = {};
        data["requestId"] = getRequestId();
        data["name"] = $("#rname").text();
        //update server database to cancel the reply
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
        setTimeout(function() {
            location.reload(); //will redirect to your blog page (an ex: blog.html)
        }, 1000);
    });

    return false;
});

//retrieve request id from the url
function getRequestId() {
    return window.location.href.split('/')[window.location.href.split('/').length - 1];
}

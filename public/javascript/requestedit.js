/*
 * requestedit.js takes cares of all the update, edit and other actions for the
 * user that create the request to handle.
 * created by tcheng
*/
$(document).ready(function() {
    //by clicking on the list of replied user, the owner can select the
    //person that will be assigned the job
  $(".replieUser").click(function() {
      //login check
    if ($("#status").text()=="Login"){
      window.location = "/login";
    }else{
        //prompt selection window to confirm selection
      var uid =  $(this).attr("value");
      var uname = $(this).attr("value2");
      var msg = "select " + uname + " ?";
        // if confirm perform ajax
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

  //once the task is done, the task should be removed parmenantly from the database
  $("#done").click(function() {
    var uid =  $(this).attr("value");
    //check login status
    if ($("#status").text()=="Login"){
      window.location = "/login";
    }else{
        //prompt confirmation upon completion
      if(confirm('Request Complete?')){
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

//delete the request
  $("#delete").click(function() {
      //check login status
    if ($("#status").text()=="Login"){
      window.location = "/login";
    }else{
        //delete request confirmation prompt
      if(confirm('Delete Request?')){
        console.log("delete");
        var data = {};
        data["requestId"] = getRequestId();
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

//redirect user to update form page
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

//get id of the request
function getRequestId() {
    return window.location.href.split('/')[window.location.href.split('/').length-1] ;
}

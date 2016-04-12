$(document).ready(function() {
    $("#ok").hide();
    $("#edit").click(function() {
        if ($("#status").text() == "Login") {
            window.location = "/login";
        } else {
            $("#DisN").attr("contentEditable", "true");
            $("#DisN").focus();
            $("#edit").hide();
            $("#ok").show();
            var uid = $("#ok").attr("value");
        }
    });
    $("#ok").click(function() {
        if ($("#status").text() == "Login") {
            window.location = "/login";
        } else {
            console.log("hihi");
            var uid = $("#ok").attr("value");
            console.log(uid);
            var uname = $("#DisN").html();
            var msg = "change display name to " + uname + " ?";
            if(confirm(msg)){
              var data = {};
              //data["userId"] = uid;
              data["dname"] = uname;
              $.ajax({
                  type: "POST",
                  url: "/updateDisplay",
                  data: data,
                  error: function(xhr) {
                      $("#message").text(xhr.statusText);
                      console.log(xhr.statusText);
                  },
                  success: function(result) {
                    console.log("ok");
                  }
              });
              window.location = "/profile";
            }
        }
    });
});

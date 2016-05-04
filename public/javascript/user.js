/* user.js
 * the user profile page control javascript
 * user can see and manage all actions of the profile page
 * created by tcheng
*/

$(document).ready(function() {
    $("#ok").hide();
    //able to edit name
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
    //proceed the update of display name of user
    $("#ok").click(function() {
        if ($("#status").text() == "Login") {
            window.location = "/login";
        } else {

            var uid = $("#ok").attr("value");

            var uname = $("#DisN").html().trim();
            //checking of input
            if(uname == ""){
              window.alert("Cannot be blank!");
              setTimeout(function() {
                  window.location = "/profile";
              }, 1000);
              return;
            }
            //confirmation prompt
            var msg = "change display name to " + uname + " ?";
            if(confirm(msg)){
              var data = {};
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
              setTimeout(function() {
                  window.location = "/profile";
              }, 1000);

            }
        }
    });
});

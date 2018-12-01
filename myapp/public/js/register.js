var errorDiv = document.getElementById("formErrors");
var nam = document.getElementById("fullName");
var email = document.getElementById("email");
var pass = document.getElementById("password");
var con = document.getElementById("passwordConfirm");
var sub = document.getElementById("submit");
var $userh1 = $("#userh1");
sub.addEventListener("click", validate);

function validate() {
    var success = true;
    var errorString = "";
    if (nam.value.length < 1) {
        errorString += "<li>Missing full name.</li>";
        nam.style.border = "2px red solid";
        success = false;
    }
    var patt = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/);
    if (!(patt.test(email.value))) {
        errorString += "<li>Invalid or missing email address.</li>";
        email.style.border = "2px red solid";
        success = false;
    }
    else
        email.style.border = "1px #aaa solid";
    if (pass.value.length < 10 || pass.value.length > 20) {
        errorString += "<li>Password must be between 10 and 20 characters.</li>";
        pass.style.border = "2px red solid";
        success = false;
    }
    var lower = new RegExp(/[a-z]/)
    if (!(lower.test(pass.value))) {
        errorString += "<li>Password must contain at least one lowercase character.</li>";
        pass.style.border = "2px red solid";
        success = false;
    }
    else
        pass.style.border = "1px #aaa solid";
    var upper = new RegExp(/[A-Z]/)
    if (!(upper.test(pass.value))) {
        errorString += "<li>Password must contain at least one uppercase character.</li>";
        pass.style.border = "2px red solid";
        success = false;
    }
    var dig = new RegExp(/\d/)
    if (!(dig.test(pass.value))) {
        errorString += "<li>Password must contain at least one digit.</li>";
        pass.style.border = "2px red solid";
        success = false;
    }
    if (pass.value !== con.value) {
        errorString += "<li>Password and confirmation password don't match.</li>";
        con.style.border = "2px red solid";
        success = false;
    }
    else
        con.style.border = "1px black solid";
    if (errorString.length != 0) {
        errorDiv.style.display = "block";
        errorDiv.innerHTML = "<ul>" + errorString + "</ul>";
    } else {
        errorDiv.style.display = "none";
        errorDiv.innerHTML = "";
    }
    if (success) {
        $("#registerscreen").css("height", "400px");
        reg();
    }
    else
        $("#registerscreen").css("height", "500px");
}

function reg() {
    var queryString = {
        name: nam.value,
        email: email.value,
        pass: pass.value,
        uvThresh: 100,
        actType: "NONE"
    };
    $.ajax({
        type: "POST",
        url: "http://ec2-34-205-125-158.compute-1.amazonaws.com:3000/home.html/user/register",
        data: JSON.stringify(queryString),
        contentType: "application/json"
    }).done(function (data) {
        $userh1.text("Registration Successful");
        $userh1.css("color", "green");
        $("#loginemail").val(queryString.email);
        setTimeout(function () { $("#loginbtn").trigger("click"); }, 1000);
    }).fail(function (data) {
        if (data.status == 400) {
            $userh1.text(data.responseJSON.error);
            $userh1.css("color", "red");
        }

    });
}


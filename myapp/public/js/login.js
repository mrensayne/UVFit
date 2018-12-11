
$useremaillog = $("#loginemail");
$userpasslog = $("#loginpassword");
$loginuserbtn = $("#loginuserbtn");

function loginuser() {
    var queryString = {
        email: $useremaillog.val(),
        password: $userpasslog.val()
    };
    var test = JSON.stringify(queryString);
    $.ajax({
        type: "GET",
        url: "https://ec2-54-156-137-117.compute-1.amazonaws.com:3000/home.html/user/login",
        data: queryString,
        contentType: "application/json",
        response: "application/json"
    }).done(function (data) {
        if (data.success) {
            $("#userh1login").text("Welcome " + data.person.name).css("color", "green");
            localStorage.auth = data.auth;
            localStorage.setItem("currentUser", JSON.stringify(data.person));
            $("#userInfo").text(data.person.name);
            $("#logtogglein").css("display", "none");
            $("#logtoggleout").css("display", "inline-block");
            $("#uvthreshli").css("display", "inline-block");
            $("#updateli").css("display", "inline-block");
            setTimeout(function () { $("#homebtn").trigger("click"); $("#deviceli").css('display', 'inline-block'); $('#registerbtn').css('display', 'none'); }, 1000);
            var user = data.person;
            var deviceDisplay = '<h1>Home Screen</h1><h2>Devices</h2>';
            $homediv.html("");
            for (var i = 0; i < user.dev.length; i++) { // for all devices
                deviceDisplay += '<div>Device: ' + user.dev[i].devID + '</div>';
                for (var ev = 0; ev < user.activities.length; ev++) {//for all events in a user
                    if (user.dev[i].devID == user.activities[ev].deviceID) {// if the event matches the displaying deviceid
                        deviceDisplay += '<div>longitute: ' + user.activities[ev].longitude + ' latitude: ' + user.activities[ev].latitude + ' UV: ' + user.activities[ev].UV + ' speed: ' + user.activities[ev].speed + '</div>';
                    }
                }
                $homediv.append(deviceDisplay);
                deviceDisplay = "";
            }
        }
    }).fail(function (data) {
        if (data.status == 401) {
            $("#loginerror").text(data.responseJSON.error);
            $("#loginerror").css("color", "red");
        }

    });
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    //add an endpoint that takes this data and creates a profile if it doesn't already exist; 
    //else, return token
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }

$loginuserbtn.click(function () {
    var useremailerror = false;
    var userpassworderror = false;
    if ($useremaillog.val().length == 0) {
        useremailerror = true;
    }

    if ($userpasslog.val().length == 0) {
        userpassworderror = true;
    }

    if (useremailerror || userpassworderror) {
        $("#loginerror").css("color", "red").html("");
        $("#loginscreen").css("height", "300px");
        if (useremailerror) {
            $("#loginerror").append("Please put in your email<br>");
        }
        if (userpassworderror) {
            $("#loginerror").append("Please put in your password");
        }
    }
    else {
        $("#loginerror").css("color", "ghostwhite").html("");
        $("#loginscreen").css("height", "280px");
    }
    if (!(useremailerror || userpassworderror)) {
        loginuser();
    }
});

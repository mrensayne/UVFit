
// Your code here!
var registeropen = false;
var loginopen = false;
var homeopen = true;
var safetochange = false;
var deviceopen = false;
var UVMenuOpen = false;
var updateopen = false;
var summaryopen = false;
var lat = 0.0;
var lon = 0.0;
$homebtn = $("#homebtn");
$loginbtn = $("#loginbtn");
$regbtn = $("#registerbtn");
$conbtn = $("#contactbtn");
$regdiv = $("#registerscreen");
$logdiv = $("#loginscreen");
$homebtn = $("#homebtn");
$homediv = $("#homescreen");
$logoutbtn = $("#logoutbtn");
$addbtn = $("#AddDevicebtn");
$devicediv = $("#deviceaddscreen");
$devicesub = $("#devicesumbitadd");
$updatebtn = $("#updatebtn");
$uvforecast = $("#uvforecast");
$uvThreshBtn = $("#uvthreshbtn");
$summarybtn = $("#summarybtn");
$summary = $("#summary");
$sumtimeval = $("#sumtimeval");
$sumcalval = $("#sumcalval");
$sumuvval = $("#sumuvval");


function getUVForecast() {
    if (lat == 0.0 || lon == 0.0) { //default if we haven't gotten lat/lon values yet
        lat = 30.75;
        lon = 40.25;
    }
    $.ajax({
        type: "GET",
        url: "http://api.openweathermap.org/data/2.5/uvi/forecast",
        data: {
            appid: "51b27e7f1f098a7d255840aad376f484",
            lat: lat,
            lon: lon,
            cnt: "3"
        }
    }).done(function (data) {
        $uvforecast.html("<table><caption>UV Forecast for (" + data[0].lat + ", " + data[0].lon + ")</caption> <tr><td>Today</td><td>" + data[0].value + "</td></tr><tr><td>Tomorrow</td><td>" + data[1].value + "</td></tr><tr><td>Day After Tomorrow</td><td>" + data[2].value + "</td></tr></table>");
    }).fail(function (data) {
        console.log("Fail: " + data);
    });
}

function summarize(){
    var time = 0.0;
    var uv = 0.0;
    var cal = 0.0;
    var temp = new Date(today);
    if(temp.getDate() <= 7) var temp1 = new Date(temp.getFullYear(), temp.getMonth() - 1, 30 - (7 - temp.getDate()));
    else var temp1 = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate() - 7);
    if (localStorage.auth) {
        $.ajax({
            type: "GET",
            url: "http://ec2-18-206-119-178.compute-1.amazonaws.com:3000/home.html/user/account",
            headers: { 'x-auth': localStorage.getItem("auth") },
            response: "json"
        }).done(function (data) {
            if (data) {
                localStorage.setItem('currentUser', JSON.stringify(data));
                var user = data;
                for (var i = 0; i < user.dev.length; i++) { // for all devices
                    for (var ev = 0; ev < user.activities.length; ev++) {//for all events in a user
                        var dat = new Date(user.activities[ev].eventTime);
                        if (user.dev[i].devID == user.activities[ev].deviceID && ((dat < temp) && (temp1 < dat))) {// if the event matches the displaying deviceid
                            time = time + user.activities[ev].eventDuration;
                            uv = uv + user.activites[ev].uv[0];
                            cal = cal + user.activities[ev].calories;
                        }
                    }
                }
            }
        }).fail(function (data) {
            localStorage.clear();
        });
    }
    else {
        localStorage.clear();
    }
    $sumtimeval.innerHTML = time + " minutes";
    $sumuvval.innerHTML = uv;
    $sumcalval.innerHTML = cal + " calories";
}

function getAndDisplayDeviceData() {
    if (localStorage.auth) {
        $.ajax({
            type: "GET",
            url: "http://ec2-18-206-119-178.compute-1.amazonaws.com:3000/home.html/user/account",
            headers: { 'x-auth': localStorage.getItem("auth") },
            response: "json"
        }).done(function (data) {
            if (data) {
                localStorage.setItem('currentUser', JSON.stringify(data));
                var user = data;
                var deviceDisplay = '<h1>Home Screen</h1>< h2 > Devices</h2>';
                $homediv.html(deviceDisplay);
                for (var i = 0; i < user.dev.length; i++) { // for all devices
                    deviceDisplay += '<div>Device: ' + user.dev[i].devID + '</div>';
                    for (var ev = 0; ev < user.events.length; ev++) {//for all events in a user
                        if (user.dev[i].devID == user.events[ev].deviceID) {// if the event matches the displaying deviceid
                            deviceDisplay += '<div>longitute: ' + user.events[ev].longitude + ' latitude: ' + user.events[ev].latitude + ' UV: ' + user.events[ev].UV + ' speed: ' + user.events[ev].speed + '</div>';
                            lon = user.events[ev].longitude;
                            lat = user.events[ev].latitude;
                        }
                    }
                    $homediv.append(deviceDisplay);
                    deviceDisplay = "";
                }
                initSiteForUser();
            }
        }).fail(function (data) {
            localStorage.clear();
        });
    }
    else {
        localStorage.clear();
    }

}

function initSiteForUser() {
    var user = JSON.parse(localStorage.getItem('currentUser'));
    $("#userInfo").text(user.name);
    $("#logtogglein").css("display", "none");
    $("#logtoggleout").css("display", "inline-block");
    $("#updateli").css("display", "inline-block");
    $("#uvthreshli").css("display", "inline-block");
    $('#deviceli').css("display", 'inline-block');
    $('#registerbtn').css('display', 'none');
    summarybtn.css("display", "inline-block");
    var deviceDisplay = "";
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

$(document).ready()
{
    if (localStorage.auth) {
        $.ajax({
            type: "GET",
            url: "http://ec2-18-206-119-178.compute-1.amazonaws.com:3000/home.html/user/account",
            headers: { 'x-auth': localStorage.getItem("auth") },
            response: "json"
        }).done(function (data) {
            if (data) {
                localStorage.setItem('currentUser', JSON.stringify(data));
                initSiteForUser();
                getUVForecast();
            }
        }).fail(function (data) {
            localStorage.clear();
        });
    }
    else {
        localStorage.clear();
    }
    safetochange = true;
}

function deviceAddFunc() {
    if ($("#deviceinput").val() == "")
        return;
    regDevice();
}



function regDevice() {

    $.ajax({
        type: "POST",
        url: "http://ec2-18-206-119-178.compute-1.amazonaws.com:3000/home.html/user/device",
        headers: { 'x-auth': localStorage.getItem("auth"), 'dev': $("#deviceinput").val() },
        response: "json"
    }).done(function (data) {
        $("#deviceaddh1").text('Device Added').css('color', 'green');
        $("#deviceerror").html("").css('color', 'red');

        setTimeout(function () {
            $("#deviceinput").fadeOut("fast"); $("#devicesumbitadd").fadeOut("fast"); $("#deviceinputlabel").fadeOut("fast"); $devicediv.animate({ height: "170px" }, { duration: 1000, queue: false });
        }, 1000);
        setTimeout(function () {
            $("#devapiinputdiv").html('<label for="deviceapi">API Key</label>').css("display", "none");
            $("#devapiinputdiv").append('<br><input type="text" name="deviceapi" id="deviceapi" readonly ></br>');
            $("#deviceapi").val(data); $("#devapiinputdiv").fadeIn("fast");

        }, 2000);

        //$("#deviceaddscreen").css("height", "100px");
    }).fail(function (data) {
        $("#deviceerror").html(data.responseText).css('color', 'red');
    });
}



//Button Hover Effects
$homebtn.hover(function () {
    $homebtn.css("background-color", "red");
}, function () {
    $homebtn.css("background-color", "#2d2d2d");
});

$loginbtn.hover(function () {
    $loginbtn.css("background-color", "red");
}, function () {
    $loginbtn.css("background-color", "#2d2d2d");
});

$updatebtn.hover(function () {
    $updatebtn.css("background-color", "red");
}, function () {
    $updatebtn.css("background-color", "#2d2d2d");
});

$regbtn.hover(function () {
    $regbtn.css("background-color", "red");
}, function () {
    $regbtn.css("background-color", "#2d2d2d");
});

$conbtn.hover(function () {
    $conbtn.css("background-color", "red");
}, function () {
    $conbtn.css("background-color", "#2d2d2d");
});

$logoutbtn.hover(function () {
    $logoutbtn.css("background-color", "red");
}, function () {
    $logoutbtn.css("background-color", "#2d2d2d");
});

$addbtn.hover(function () {
    $addbtn.css("background-color", "red");
}, function () {
    $addbtn.css("background-color", "#2d2d2d");
});

$uvThreshBtn.hover(function () {
    $uvThreshBtn.css("background-color", "red");
}, function () {
    $uvThreshBtn.css("background-color", "#2d2d2d");
});

$summarybtn.hover(function() {
    $summarybtn.css("background-color", "red");
}, function () {
    $summarybtn.css("background-color", "#2d2d2d");
});




$addbtn.click(function () {
    if (updateopen) {
        $("#updatescreen").fadeOut("fast");
        updateopen = false;
    }
    if (UVMenuOpen) {
        $("#UvThreshMenuScreen").fadeOut("fast").css("height", "260px");
        UVMenuOpen = false;
    }
    if (summaryopen) {
        $summary.fadeOut("fast");
        summaryopen = false;
    }
    if (!deviceopen) {
        $devicediv.css("height", "200px");
        $("#devapiinputdiv").html('<input type="text" name="deviceinput" id="deviceinput"><br>');
        $("#devapiinputdiv").append('<input type="submit" name="devicesumbitadd" id="devicesumbitadd" value="Add Device" /><div id= "deviceerror" color= "red" ></div>');
        $("#deviceaddh1").text("Add Device").css("color", "ghostwhite");
        $("#devicesumbitadd").click(deviceAddFunc);
    }
    if (localStorage.getItem("auth")) {
        $homediv.fadeOut("fast");
        if (homeopen && safetochange) {
            $devicediv.css("margin-left", String($devicediv.parent().width() / 2 - $devicediv.width() / 2) + "px");
            safetochange = false;
            $devicediv.css("margin-top", "2000px");
            $devicediv.css("opacity", "0");
            $devicediv.css("display", "block");
            $devicediv.animate({
                opacity: 1,
                marginTop: "-=2000"
            }, 1000, function () {
                safetochange = true;
            });
            deviceopen = true;
            homeopen = false;
        }
    }
});


$regbtn.click(function () {
    if (updateopen) {
        $("#updatescreen").fadeOut("fast");
        updateopen = false;
    }
    if (UVMenuOpen) {
        $("#UvThreshMenuScreen").fadeOut("fast").css("height", "260px");
        UVMenuOpen = false;
    }
    if (summaryopen) {
        $summary.fadeOut("fast");
        summaryopen = false;
    }
    $homediv.fadeOut("fast");
    if (loginopen && safetochange) {
        safetochange = false;
        $regdiv.css("margin-top", "0");
        $regdiv.css("margin-left", "-2000px").css("opacity", "1").css("display", "block");
        $logdiv.animate({
            marginLeft: "+=2000",
        }, {
                duration: 1000, queue: false, complete: function () {
                    safetochange = true;
                }
            });
        $regdiv.animate({
            marginLeft: $regdiv.parent().width() / 2 - $regdiv.width() / 2
        }, {
                duration: 1000, queue: false, complete: function () {
                    safetochange = true;
                }
            });
        registeropen = true;
        loginopen = false;
    }
    else if (!registeropen && safetochange) {
        $regdiv.css("margin-left", String($regdiv.parent().width() / 2 - $regdiv.width() / 2) + "px");
        safetochange = false;
        $regdiv.css("margin-top", "2000px");
        $regdiv.css("opacity", "0");
        $regdiv.css("display", "block");
        $regdiv.animate({
            opacity: 1,
            marginTop: "-=2000"
        }, 1000, function () {
            safetochange = true;
        });
        registeropen = true;
        UVMenuOpen = false;
        homeopen = false;
    }
});

$loginbtn.click(function () {
    if (updateopen) {
        $("#updatescreen").fadeOut("fast");
        updateopen = false;
    }
    if (UVMenuOpen) {
        $("#UvThreshMenuScreen").fadeOut("fast").css("height", "260px");
        UVMenuOpen = false;
    }
    if (summaryopen) {
        $summary.fadeOut("fast");
        summaryopen = false;
    }
    $("#loginerror").html("");
    $("#loginpassword").val("");
    $homediv.fadeOut("fast");
    if (registeropen && safetochange) {
        safetochange = false;
        $logdiv.css("margin-top", "0");
        $logdiv.css("margin-left", "-2000px").css("opacity", "1").css("display", "block");
        $regdiv.animate({
            marginLeft: "+=2000",
        }, {
                duration: 1000, queue: false, complete: function () {
                    safetochange = true;
                }
            });
        $logdiv.animate({
            marginLeft: $logdiv.parent().width() / 2 - $logdiv.width() / 2
        }, {
                duration: 1000, queue: false, complete: function () {
                    safetochange = true;
                }
            });
        loginopen = true;
        registeropen = false;
    }
    else if (!loginopen && safetochange) {
        $logdiv.css("margin-left", String($logdiv.parent().width() / 2 - $logdiv.width() / 2) + "px");
        safetochange = false;
        $logdiv.css("margin-top", "2000px");
        $logdiv.css("opacity", "0");
        $logdiv.css("display", "block");
        $logdiv.animate({
            opacity: 1,
            marginTop: "-=2000"
        }, 1000, function () {
            safetochange = true;
        });
        loginopen = true;
        homeopen = false;
    }
});

$homebtn.click(function () {
    if (updateopen) {
        $("#updatescreen").fadeOut("fast");
        updateopen = false;
    }
    if (summaryopen) {
        $summary.fadeOut("fast");
        summaryopen = false;
    }
    if (UVMenuOpen) {
        $("#UvThreshMenuScreen").fadeOut("fast").css("height", "260px");
        UVMenuOpen = false;
    }
    if (!homeopen && registeropen) {
        safetochange = false;
        $regdiv.animate({
            opacity: 0,
            marginTop: "+=1000"
        }, 1000, function () {
            $homediv.fadeIn("slow");
            safetochange = true;
        });
    }
    else if (!homeopen && loginopen) {
        safetochange = false;
        $logdiv.animate({
            opacity: 0,
            marginTop: "+=1000"
        }, 1000, function () {
            $homediv.fadeIn("slow");
            safetochange = true;
        });
    }
    else if (!homeopen && deviceopen) {
        safetochange = false;

        $devicediv.animate({
            opacity: 0,
            marginTop: "+=1000"
        }, 1000, function () {
            $homediv.fadeIn("slow");
            safetochange = true;
        });
    }
    else {
        $homediv.fadeIn("slow");
    }
    homeopen = true;
    registeropen = false;
    loginopen = false;
    deviceopen = false;
});

$logoutbtn.click(function () {
    localStorage.clear();
    location.reload(true);
});

$summarybtn.click(function () {
    summarize();
    if (updateopen) {
        $("#updatescreen").fadeOut("fast");
        updateopen = false;
    }
    if (UVMenuOpen) {
        $("#UvThreshMenuScreen").fadeOut("fast").css("height", "260px");
        UVMenuOpen = false;
    }
    $homediv.fadeOut("fast");
    if (registeropen) {
        safetochange = false;
        $regdiv.animate({
            opacity: 0,
            marginTop: "+=1000"
        }, 1000, function () {
            $summary.fadeIn("slow");
            safetochange = true;
        });
    }
    else if (loginopen) {
        safetochange = false;
        $logdiv.animate({
            opacity: 0,
            marginTop: "+=1000"
        }, 1000, function () {
            $summary.fadeIn("slow");
            safetochange = true;
        });
    }
    else if (deviceopen) {
        safetochange = false;

        $devicediv.animate({
            opacity: 0,
            marginTop: "+=1000"
        }, 1000, function () {
            $summary.fadeIn("slow");
            safetochange = true;
        });
    }
    else {
        $summary.fadeIn("slow");
    }
    summaryopen = true;
    homeopen = false;
    registeropen = false;
    loginopen = false;
    deviceopen = false;
});

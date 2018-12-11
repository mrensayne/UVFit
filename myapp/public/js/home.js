// Your code here!
var registeropen = false;
var loginopen = false;
var homeopen = true;
var safetochange = false;
var deviceopen = false;
var UVMenuOpen = false;
var updateopen = false;
var summaryopen = false;
var sumlocalopen = false;
var sumglobalopen = false;
var activitiesopen = false;
var activityopen = false;
var changepass = false;
var lat = 0.0;
var lon = 0.0;
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
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
$uvThreshBtn = $("#uvthreshbtn");
$summarybtn = $("#summarybtn");
$summary = $("#summary");
$sumtimeval = $("#sumtimeval");
$sumcalval = $("#sumcalval");
$sumuvval = $("#sumuvval");
$summarylocalbtn = $("#summarylocalbtn");
$summarylocal = $("#summarylocal");
$numactsval = $("#numactsval");
$avgdistval = $("#avgdistval");
$avgcalval = $("#avgcalval");
$avguvval = $("#avguvval");
$summaryglobalbtn = $("#summaryglobalbtn");
$summaryglobal = $("#summaryglobal");
$numactsvalg = $("#numactsvalg");
$avgdistvalg = $("#avgdistvalg");
$avgcalvalg = $("#avgcalvalg");
$avguvvalg = $("#avguvvalg");
$actTypeChange = $("#actTypeChange");
$activitiesBtn = $("#actslibtn");
$activities = $("#activities");
$activity = $("#activityMap");

function concatArray(oldArray, newArray) {
    var returnArray = []
    returnArray = oldArray;
    var returnArrayLength = returnArray.length;
    for (var x = 0; x < newArray.length; x++) {
        returnArray[x + returnArrayLength] = newArray[x];
    }
    return returnArray;
}

function combinePacketsToActivities(packets) {// Finally will fix all problems when it comes to packets being confused as activities [Will return activties array where each element is a full activity]
    var activities = [];
    var UVsummation = 0;
    var eventTime;
    var deviceID;
    var actTypeAct;
    var CalSummation = 0;
    var LatArray = [];
    var LongArray = [];
    var nextPacketPartOfCurAct;
    var currEventId = packets[0].eventID;

    for (var x = 0; x < packets.length; x++) {
        //State Machine to find out what whether the next packet is part of our activity or not
        if (typeof packets[x + 1] === 'undefined') { // There is no next packet
            nextPacketPartOfCurAct = false;
        }
        else {// we are safe to check ahead
            if (packets[x + 1].eventID == currEventId) { // The next packet is part of our current activity
                nextPacketPartOfCurAct = true;
            }
            else {// Next Packet is a new activity
                nextPacketPartOfCurAct = false;
                currEventId = packets[x + 1].eventID;
            }
        }
        if (nextPacketPartOfCurAct) { // We know the next packet will be part of current activity
            var UVArray = JSON.parse(packets[x].UV);
            for (var i = 0; i < UVArray.length; i++) {//summing up all UV in Packet
                UVsummation += UVArray[i];
            }
            CalSummation += packets[x].calories;
            LatArray = concatArray(LatArray, JSON.parse(packets[x].latitude));
            LongArray = concatArray(LongArray, JSON.parse(packets[x].longitude));

        }
        else { // We know that this will be the end of our activity
            var UVArray = JSON.parse(packets[x].UV);
            for (var i = 0; i < UVArray.length; i++) {//summing up all UV in Packet
                UVsummation += UVArray[i];
            }
            CalSummation += packets[x].calories;
            LatArray = concatArray(LatArray, JSON.parse(packets[x].latitude));
            LongArray = concatArray(LongArray, JSON.parse(packets[x].longitude));
            activities.push({
                'UV': UVsummation,
                'deviceID': packets[x].deviceID,
                'actTypeAct': packets[x].actTypeAct,
                'calories': CalSummation,
                'eventTime': packets[x].eventTime,
                'eventDuration': packets[x].eventDuration,
                'latitude': LatArray,
                'longitude': LongArray,
                'eventID': packets[x].eventID
            });
            UVArray = 0;
            UVsummation = 0;
            LatArray = [];
            LongArray = [];
        }


    }
    return activities;
}

//get all activities of user
function getActivities() {
    console.log("activities clicked!");
    if (localStorage.auth) {
        $.ajax({
            type: "get",
            url: "https://ec2-54-156-137-117.compute-1.amazonaws.com:3000/home.html/user/account",
            headers: { 'x-auth': localStorage.getItem("auth") },
            response: "json"
        }).done(function (data) {
            if (data) {
                localStorage.setItem('currentuser', JSON.stringify(data));
                let acts = document.getElementById("activities");
                acts.innerHTML = "";
                let actHeader = document.createElement("div");
                actHeader.className = "actcontainer";

                let actHeaderName = document.createElement("div");
                let actHeaderDate = document.createElement("div");
                let actHeaderCal = document.createElement("div");
                let actHeaderUV = document.createElement("div");
                let actHeaderDur = document.createElement("div");

                actHeaderName.innerHTML = "Type";
                actHeaderDate.innerHTML = "Date";
                actHeaderCal.innerHTML = "Calories Burned";
                actHeaderUV.innerHTML = "Avg UV Exposure";
                actHeaderDur.innerHTML = "Activity Duration";

                actHeader.appendChild(actHeaderName);
                actHeader.appendChild(actHeaderDate);
                actHeader.appendChild(actHeaderCal);
                actHeader.appendChild(actHeaderUV);
                actHeader.appendChild(actHeaderDur);

                acts.appendChild(actHeader);
                var activities = combinePacketsToActivities(data.activities);
                console.log(activities);
                for (var x = 0; x < activities.length; x++) {//all activities
                    let activityContainer = document.createElement("div");
                    activityContainer.className = "actcontainer";
                    activityContainer.value = x;
                    let actName = document.createElement("div");
                    let actDate = document.createElement("div");
                    let actCal = document.createElement("div");
                    let actUV = document.createElement("div");
                    let actDur = document.createElement("div");

                    actName.innerHTML = activities[x].actTypeAct;
                    actDate.innerHTML = activities[x].eventTime;
                    actCal.innerHTML = activities[x].calories;
                    actUV.innerHTML = activities[x].UV;
                    actDur.innerHTML = activities[x].eventDuration;

                    activityContainer.appendChild(actName);
                    activityContainer.appendChild(actDate);
                    activityContainer.appendChild(actCal);
                    activityContainer.appendChild(actUV);
                    activityContainer.appendChild(actDur);

                    activityContainer.addEventListener("click", function () {
                        getRoute(activities[this.value]);
                        //changeAct(this.value);
                        $homebtn.trigger('click');
                        $activity.fadeIn("slow");
                        activityopen = true;
                        $homediv.fadeOut("fast");
                    });
                    acts.appendChild(activityContainer);
                }
            }
        }).fail(function (data) {
            localStorage.clear();
        });
    }
    else {
        localStorage.clear();
    }
}


//get details and route of a single activity
function getRoute(curActivity) {
    let act = document.getElementById("activityMap");
    act.innerHTML = "";

    let actHeader = document.createElement("div");
    actHeader.className = "actcontainer";

    let actHeaderName = document.createElement("div");
    let actHeaderDate = document.createElement("div");
    let actHeaderCal = document.createElement("div");
    let actHeaderUV = document.createElement("div");
    let actHeaderDur = document.createElement("div");

    actHeaderName.innerHTML = "Type";
    actHeaderDate.innerHTML = "Date";
    actHeaderCal.innerHTML = "Calories Burned";
    actHeaderUV.innerHTML = "Avg UV Exposure";
    actHeaderDur.innerHTML = "Activity Duration";

    actHeader.appendChild(actHeaderName);
    actHeader.appendChild(actHeaderDate);
    actHeader.appendChild(actHeaderCal);
    actHeader.appendChild(actHeaderUV);
    actHeader.appendChild(actHeaderDur);

    act.appendChild(actHeader);

    let activityContainer = document.createElement("div");
    activityContainer.className = "actcontainer";
    let actDate = document.createElement("div");
    let actCal = document.createElement("div");
    let actUV = document.createElement("div");
    let actDur = document.createElement("div");
    //Allowing for selection of activity
    var actName = document.createElement("select");
    let running = document.createElement("option");
    let walking = document.createElement("option");
    let biking = document.createElement("option");

    running.innerHTML = "Running";
    walking.innerHTML = "Walking";
    biking.innerHTML = "Biking";

    actName.appendChild(running);
    actName.appendChild(walking);
    actName.appendChild(biking);

    actName.value = curActivity.actTypeAct;


    actDate.innerHTML = curActivity.eventTime;
    actCal.innerHTML = curActivity.calories;
    actDur.innerHTML = curActivity.eventDuration;
    actUV.innerHTML = curActivity.UV / curActivity.eventDuration;

    activityContainer.appendChild(actName);
    activityContainer.appendChild(actDate);
    activityContainer.appendChild(actCal);
    activityContainer.appendChild(actUV);
    activityContainer.appendChild(actDur);
    act.appendChild(activityContainer);

    let mapDOM = document.createElement("div");
    mapDOM.id = "map";
    act.appendChild(mapDOM);

    createMap(curActivity.latitude, curActivity.longitude);
    actName.addEventListener('change', function () {
        changeAct(curActivity.eventID, actName.options[actName.selectedIndex].text);
    });
}
//uses googleMap API to create a map and route the activity
function createMap(lats, longs) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12
    });
    var flightPathCoordinates = [];
    let bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < lats.length; i++) {
        let point = { lat: lats[i], lng: longs[i] };
        var marker = new google.maps.Marker({
            position: point,
            label: labels[labelIndex++ % labels.length],
            map: map
        });

        flightPathCoordinates.push(marker.getPosition());
        bounds.extend(marker.position);
    }
    map.fitBounds(bounds);
    var flightPath = new google.maps.Polyline({
        map: map,
        path: flightPathCoordinates,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
}
function getUVForecast() {
    $uvforecast = $("#uvforecast");
    if (lat == 0.0 || lon == 0.0) { //default if we haven't gotten lat/lon values yet
        lat = 30.75;
        lon = 40.25;
    }
    $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/uvi/forecast",
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

function summarize() {
    var time = 0.0;
    var uv = 0.0;
    var cal = 0.0;
    var temp = new Date();
    if (temp.getDate() <= 7) var temp1 = new Date(temp.getFullYear(), temp.getMonth() - 1, 30 - (7 - temp.getDate()));
    else var temp1 = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate() - 7);
    if (localStorage.auth) {
        $.ajax({
            type: "GET",
            url: "https://ec2-54-156-137-117.compute-1.amazonaws.com:3000/home.html/user/account",
            headers: { 'x-auth': localStorage.getItem("auth") },
            response: "json"
        }).done(function (data) {
            if (data) {
                localStorage.setItem('currentUser', JSON.stringify(data));
                var user = data;
                for (var x = 0; x < user.activities.length; x++) {//All Activities
                    var dat = new Date(user.activities[x].eventTime);
                    if (dat < temp && temp1 < dat) {
                        //We need to parse this because it was saved as a JSON inside of the object instead of as an integer array
                        var UVarray = JSON.parse(user.activities[x].UV);
                        //Every activity has a TOTAL duration. This duration can spam multiple activities, so to calculate this we need to just add up all datapoints grabbed total
                        //Because we know the frequency of every datapoint is 1HZ
                        time = time + UVarray.length;
                        //calories are calculated per activity so we can simple add them up over all activities
                        cal = cal + user.activities[x].calories;
                        //We need an extra loop here to add up all UV integers in each activity
                        for (var y = 0; y < UVarray.length; y++) {//All data points in an activity
                            uv = uv + UVarray[y];
                        }
                    }
                }
            }
            $sumtimeval.html(time + " seconds");
            $sumuvval.html(uv);
            $sumcalval.html(cal + " calories");
        }).fail(function (data) {
            localStorage.clear();
        });
    }
    else {
        localStorage.clear();
    }
}

function summarizeLocal() {
    var dist = 0.0;
    var uv = 0.0;
    var cal = 0.0;
    var speed = 0.0;
    var UVavg = 0.0;
    var distAvg = 0.0;
    var calAvg = 0.0;
    var actNum = 0.0;
    var i = 0;
    var temp = new Date();
    if (temp.getDate() <= 7) var temp1 = new Date(temp.getFullYear(), temp.getMonth() - 1, 30 - (7 - temp.getDate()));
    else var temp1 = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate() - 7);
    //need to alter the API to allow pulling *all* users
    if (localStorage.auth) {
        $.ajax({
            type: "GET",
            url: "https://ec2-54-156-137-117.compute-1.amazonaws.com:3000/home.html/user/users",
            headers: { 'x-auth': localStorage.getItem("auth") },
            response: "json"
        }).done(function (data) {
            if (data) {
                for (var z = 0; z < data.length; z++) { //change this based on how we update the API
                    var user = data[z];
                    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    var curuserlong = JSON.parse(currentUser.activities[0].longitude);
                    var curuserlat = JSON.parse(currentUser.activities[0].latitude);
                    var checklongarray = JSON.parse(user.activities[0].longitude);
                    var checklatarray = JSON.parse(user.activities[0].latitude);
                    if ((checklatarray[0] - 5 <= curuserlat[0] && checklatarray[0] + 5 >= curuserlat[0]) && (checklongarray[0] - 5 <= curuserlong[0] && checklongarray[0] + 5 >= curuserlong[0])) { //"local" check
                        console.log("made it in local description");
                        for (var x = 0; x < user.activities.length; x++) {
                            actNum++;
                            var UVarray = JSON.parse(user.activities[x].UV);
                            var speedArray = JSON.parse(user.activities[x].speed);
                            for (var y = 0; y < speedArray.length; y++) {
                                speed = speed + speedArray[y];
                            }
                            speed = speed / speedArray.length;
                            dist = UVarray.length * speed; //time * speed average
                            cal = cal + user.activities[x].calories;
                            //We need an extra loop here to add up all UV integers in each activity
                            for (var y = 0; y < UVarray.length; y++) {//All data points in an activity
                                uv = uv + UVarray[y];
                                i++;
                            }
                        }
                        UVavg = UVavg + uv;
                        distAvg = distAvg + dist;
                        calAvg = calAvg + cal;
                        uv = 0.0;
                        dist = 0.0;
                        cal = 0.0;
                        speed = 0.0;
                    }
                }
                UVavg = UVavg / i;
                distAvg = distAvg / actNum;
                calAvg = calAvg / actNum;
            }
            //update html with that data
            $avguvval.html(UVavg);
            $avgdistval.html(distAvg);
            $avgcalval.html(calAvg);
            $numactsval.html(actNum);
        }).fail(function (data) {
            localStorage.clear();
        });
    }
    else {
        localStorage.clear();
    }
}

//Takes the eventID we are going to want to change as well as what we want to change it to
function changeAct(eventID, ActType) {
    var user = JSON.parse(localStorage.getItem('currentUser'));
    $.ajax({
        type: "GET",
        url: "https://ec2-54-156-137-117.compute-1.amazonaws.com:3000/home.html/user/ChangeAct",
        data: {
            'actType': ActType,
            'email': user.email,
            'eventID': eventID 
        }
    }).done(function (data) {
        //update local HTML
        if (data) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('auth', data.auth);
        }
    }).fail(function (data) {
        console.log("Fail: " + data);
    });
}

function summarizeGlobal() {
    var dist = 0.0;
    var uv = 0.0;
    var cal = 0.0;
    var speed = 0.0;
    var UVavg = 0.0;
    var distAvg = 0.0;
    var calAvg = 0.0;
    var actNum = 0.0;
    var i = 0;
    var temp = new Date();
    if (temp.getDate() <= 7) var temp1 = new Date(temp.getFullYear(), temp.getMonth() - 1, 30 - (7 - temp.getDate()));
    else var temp1 = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate() - 7);
    //need to alter the API to allow pulling *all* users
    if (localStorage.auth) {
        $.ajax({
            type: "GET",
            url: "https://ec2-54-156-137-117.compute-1.amazonaws.com:3000/home.html/user/users",
            headers: { 'x-auth': localStorage.getItem("auth") },
            response: "json"
        }).done(function (data) {
            if (data) {
                for (var z = 0; z < data.length; z++) { //change this based on how we update the API
                    var user = data[z];
                    console.log(user);
                    for (var x = 0; x < user.activities.length; x++) {
                        actNum++;
                        console.log("In for loop");
                        var UVarray = JSON.parse(user.activities[x].UV);
                        var speedArray = JSON.parse(user.activities[x].speed);
                        for (var y = 0; y < speedArray.length; y++) {
                            speed = speed + speedArray[y];
                        }
                        speed = speed / speedArray.length;
                        dist = UVarray.length * speed; //time * speed average
                        cal = cal + user.activities[x].calories;
                        //We need an extra loop here to add up all UV integers in each activity
                        for (var y = 0; y < UVarray.length; y++) {//All data points in an activity
                            uv = uv + UVarray[y];
                            i++;
                        }
                    }
                    UVavg = UVavg + uv;
                    distAvg = distAvg + dist;
                    calAvg = calAvg + cal;
                    uv = 0.0;
                    dist = 0.0;
                    cal = 0.0;
                    speed = 0.0;
                }
                UVavg = UVavg / i;
                distAvg = distAvg / actNum;
                calAvg = calAvg / actNum;
            }
            //update html with that data
            $avguvvalg.html(UVavg);
            $avgdistvalg.html(distAvg);
            $avgcalvalg.html(calAvg);
            $numactsvalg.html(actNum);
        }).fail(function (data) {
            localStorage.clear();
        });
    }
    else {
        localStorage.clear();
    }
}

function getAndDisplayDeviceData() {
    if (localStorage.auth) {
        $.ajax({
            type: "GET",
            url: "https://ec2-54-156-137-117.compute-1.amazonaws.com:3000/home.html/user/account",
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
    $activity.css("display", "none");
    $("#userInfo").text(user.name);
    $("#logtogglein").css("display", "none");
    $(".g-signin2").css("display", "none");
    $("#logtoggleout").css("display", "inline-block");
    $("#updateli").css("display", "inline-block");
    $("#uvthreshli").css("display", "inline-block");
    $('#deviceli').css("display", 'inline-block');
    $('#registerbtn').css('display', 'none');
    $summarybtn.css("display", "inline-block");
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
    //$homediv.append("<h2>UV Forceast</h2> <div id=\"uvforecast\"></div>");
    getUVForecast();
}

$(document).ready()
{
    $activity.css("display", "none");
    if (localStorage.auth) {
        $.ajax({
            type: "GET",
            url: "https://ec2-54-156-137-117.compute-1.amazonaws.com:3000/home.html/user/account",
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
        url: "https://ec2-54-156-137-117.compute-1.amazonaws.com:3000/home.html/user/device",
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

$summarybtn.hover(function () {
    $summarybtn.css("background-color", "red");
}, function () {
    $summarybtn.css("background-color", "#2d2d2d");
});




$addbtn.click(function () {
    sumglobalopen = false;
    $summaryglobal.fadeOut("slow");
    sumlocalopen = false;
    $summarylocal.fadeOut("slow");
    summaryopen = false;
    $summary.fadeOut("slow");
    activitiesopen = false;
    $activities.fadeOut("slow");
    activityopen = false;
    $activity.fadeOut("slow");
    if (changepass) {
        $("#PassChangeScreen").fadeOut("fast");
        updateopen = false;
    }
    if (updateopen) {
        $("#updatescreen").fadeOut("fast");
        updateopen = false;
    }
    if (UVMenuOpen) {
        $("#UvThreshMenuScreen").fadeOut("fast").css("height", "260px");
        UVMenuOpen = false;
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
    sumglobalopen = false;
    $summaryglobal.fadeOut("slow");
    sumlocalopen = false;
    $summarylocal.fadeOut("slow");
    summaryopen = false;
    $summary.fadeOut("slow");
    activitiesopen = false;
    $activities.fadeOut("slow");
    activityopen = false;
    $activity.fadeOut("slow");
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
    else {
        $homebtn.trigger('click');
        $regdiv.animate({
            opacity: 1,
            marginTop: "-=2000"
        }, 1000, function () {
            safetochange = true;
        });
    }
});

$loginbtn.click(function () {
    sumglobalopen = false;
    $summaryglobal.fadeOut("slow");
    sumlocalopen = false;
    $summarylocal.fadeOut("slow");
    summaryopen = false;
    $summary.fadeOut("slow");
    activitiesopen = false;
    $activities.fadeOut("slow");
    activityopen = false;
    $activity.fadeOut("slow");
    if (changepass) {
        $("#PassChangeScreen").fadeOut("fast");
        updateopen = false;
    }
    if (updateopen) {
        $("#updatescreen").fadeOut("fast");
        updateopen = false;
    }
    if (UVMenuOpen) {
        $("#UvThreshMenuScreen").fadeOut("fast").css("height", "260px");
        UVMenuOpen = false;
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
    if (changepass) {
        $("#PassChangeScreen").fadeOut("fast");
    }
    if (updateopen) {
        $("#updatescreen").fadeOut("fast");
    }
    if (UVMenuOpen) {
        $("#UvThreshMenuScreen").fadeOut("fast").css("height", "260px");

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
    if (summaryopen) {
        $summary.fadeOut("fast");
    }
    if (sumlocalopen) {
        $summarylocal.fadeOut("fast");
    }
    if (sumglobalopen) {
        $summaryglobal.fadeOut("fast");
    }
    if (activitiesopen) {
        $activities.fadeOut("fast");
    }
    if (activityopen) {
        $activity.fadeOut("fast");
    }

    $homediv.fadeIn("slow");

    updateopen = false;
    homeopen = true;
    registeropen = false;
    loginopen = false;
    deviceopen = false;
    UVMenuOpen = false;
    summaryopen = false;
    sumglobalopen = false;
    sumlocalopen = false;
    activitiesopen = false;
    activityopen = false;
});

$logoutbtn.click(function () {
    //var auth2 = gapi.auth2.getAuthInstance();
    //if (auth2) auth2.signOut();
    localStorage.clear();
    location.reload(true);
});

$summarybtn.click(function () {
    $homebtn.trigger('click');
    $homediv.css("display", "none");
    summarize();
    $summary.fadeIn("slow");
    summaryopen = true;
});

$summarylocalbtn.click(function () {
    summarizeLocal();
    $homebtn.trigger('click');
    $homediv.css("display", "none");
    $summarylocal.fadeIn("slow");
    sumlocalopen = true;
});

$summaryglobalbtn.click(function () {
    summarizeGlobal();
    $homebtn.trigger('click');
    $homediv.css("display", "none");
    $summaryglobal.fadeIn("slow");
    sumglobalopen = true;
});
$activitiesBtn.click(function () {
    getActivities();
    $homebtn.trigger('click');
    $homediv.css("display", "none");
    $activities.fadeIn("slow");
    activitiesopen = true;
    $homediv.fadeOut("fast");
});
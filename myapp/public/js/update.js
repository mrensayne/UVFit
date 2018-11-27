$fullnameupdate = $("#fullNameupdate");
$emailupdate = $("#emailupdate");
$passwordupdate = $("#passwordupdate");
$deviceselect = $("#deviceselect");
$update = $("#update");
$remdevbtn = $("#removeDev");
$uvthreshinput = $("#UVThresholdSet");

$updatebtn.click(function () {
    if (updateopen) {
        return;
    }
    $homebtn.trigger("click");
    if (localStorage.getItem("auth")) {
        $.ajax({
            type: "GET",
            url: "http://ec2-18-206-119-178.compute-1.amazonaws.com:3000/home.html/user/account",
            headers: { 'x-auth': localStorage.getItem("auth") },
            response: "json"
        }).done(function (data) {
            if (data) {
                localStorage.setItem('currentUser', JSON.stringify(data));
                $fullnameupdate.val(data.name);
                $emailupdate.val(data.email);
                $passwordupdate.val("********");
                $deviceselect.html('<option value="default">Current Devices</option>');
                for (var x = 0; x < data.dev.length; x++) {
                    var test = '<option value="' + data.dev[x].devID + '" >' + data.dev[x].devID + '</option>';
                    $deviceselect.append(test);
                }
                $homebtn.trigger("click");
                $("#updatescreen").fadeIn("slow");
                $homediv.fadeOut("fast");
                updateopen = true;
            }
        }).fail(function (data) {
            localStorage.clear();
        });
    }
    else {
        localStorage.clear();
    }

});

$update.click(function () {
    var auth = localStorage.getItem("auth");
    if (!auth)
        return;
    var user = {
        name: $fullnameupdate.val(),
        email: $emailupdate.val(),
        uvThresh: $uvthreshholdupdate.val()
    };
    $.ajax({
        type: "POST",
        url: "http://ec2-18-206-119-178.compute-1.amazonaws.com:3000/home.html/user/update",
        headers: { 'x-auth': auth, 'newuser': JSON.stringify(user) },
        response: "json"
    }).done(function (data) {
        localStorage.setItem('currentUser', JSON.stringify(data));

    }).fail(function (data) {
        console.log(data);
    });
});

$uvThreshBtn.click(function () {
    if (UVMenuOpen) {
        return;
    }
    if (localStorage.getItem("auth")) {
        $.ajax({
            type: "GET",
            url: "http://ec2-18-206-119-178.compute-1.amazonaws.com:3000/home.html/user/account",
            headers: { 'x-auth': localStorage.getItem("auth") },
            response: "json"
        }).done(function (data) {
            if (data) {
                localStorage.setItem('currentUser', JSON.stringify(data));
                $uvthreshinput.val(data.uvThresh);
                $("#UVSeth1").text("Set UV Threshold").css("color", "ghostwhite");
                $homebtn.trigger("click");
                $("#UvThreshMenuScreen").fadeIn("slow").css("height", "260px");
                $homediv.fadeOut("fast");
                UVMenuOpen = true;
                $("#ActTypeSelect").val(data.actType);
            }
        }).fail(function (data) {
            localStorage.clear();
        });
    }
    else {
        localStorage.clear();
    }
});

$("#UvThreshSubmit").click(function () {
    var auth = localStorage.getItem("auth");
    var user = localStorage.getItem("currentUser");
    if (!auth || !user)
        return;
    var userObj = JSON.parse(user);
    var temptype = $('#ActTypeSelect').find(":selected").text();
    temptype = temptype.replace(/^\s+|\s+$/g, '');
    var user = {
        name: userObj.name,
        email: userObj.email,
        uvThresh: $uvthreshinput.val(),
        actType: temptype
    };
    $.ajax({
        type: "POST",
        url: "http://ec2-18-206-119-178.compute-1.amazonaws.com:3000/home.html/user/update",
        headers: { 'x-auth': auth, 'newuser': JSON.stringify(user) },
        response: "json"
    }).done(function (data) {
        localStorage.setItem('currentUser', JSON.stringify(data));
        $("#UVSeth1").text("Updated").css("color", "green");
        setTimeout(function () { $homebtn.trigger("click"); }, 2000);
    }).fail(function (data) {
        $("#UVSeth1").text("Failed to update").css("color", "red");
    });
});

$remdevbtn.click(function () {
    var auth = localStorage.getItem("auth");
    var user = localStorage.getItem("currentUser");
    if (!auth || !user)
        return;
    var userObj = JSON.parse(user);
    var deviceRemove = $('#deviceselect').find(":selected").text();
    $.ajax({
        type: "DELETE",
        url: "http://ec2-18-206-119-178.compute-1.amazonaws.com:3000/home.html/user/removeDev",
        headers: { 'x-auth': auth, 'zzrot': deviceRemove },
        response: "json"
    }).done(function (data) {
        $("#updateh1").text(data).css("color", "green");
        setTimeout(function () { $homebtn.trigger("click"); }, 2000);
    }).fail(function (data) {
        $("#updateh1").text(data.responseJSON).css("color", "red");
    });
});
$fullnameupdate = $("#fullNameupdate");
$emailupdate = $("#emailupdate");
$passwordupdate = $("#passwordupdate");
$deviceselect = $("#deviceselect");
$update = $("#update");
$remdevbtn = $("#removeDev");
$uvthreshinput = $("#UVThresholdSet");
$changePassBtn = $("#UpdPass");
$newPassSubmit = $("#currPassSubmit");


$updatebtn.click(function () {
    if (updateopen) {
        return;
    }
    $homebtn.trigger("click");
    if (localStorage.getItem("auth")) {
        $.ajax({
            type: "GET",
            url: "https://ece513final.tk:3000/home.html/user/account",
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
    };
    $.ajax({
        type: "POST",
        url: "https://ece513final.tk:3000/home.html/user/update",
        headers: { 'x-auth': auth, 'newuser': JSON.stringify(user) },
        response: "json"
    }).done(function (data) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('auth', data.auth);
        initSiteForUser();
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
            url: "https://ece513final.tk:3000/home.html/user/account",
            headers: { 'x-auth': localStorage.getItem("auth") },
            response: "json"
        }).done(function (data) {
            if (data) {
                localStorage.setItem('currentUser', JSON.stringify(data));
                $uvthreshinput.val(data.uvThresh);
                $("#UVSeth1").text("Configure Device").css("color", "ghostwhite");
                $homebtn.trigger("click");
                $homediv.css("display", "none");
                $("#UvThreshMenuScreen").fadeIn("slow").css("height", "260px");
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
        url: "https://ece513final.tk:3000/home.html/user/update",
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
        url: "https://ece513final.tk:3000/home.html/user/removeDev",
        headers: { 'x-auth': auth, 'zzrot': deviceRemove },
        response: "json"
    }).done(function (data) {
        $("#updateh1").text(data).css("color", "green");
        setTimeout(function () { $homebtn.trigger("click"); }, 2000);
    }).fail(function (data) {
        $("#updateh1").text(data.responseJSON).css("color", "red");
    });
});

$changePassBtn.click(function () {
    $homebtn.trigger("click");
    $homediv.css("display", "none");
    $("#PassChangeScreen").fadeIn("fast");
    changepass = true;
});

$newPassSubmit.click(function () {
    var user = JSON.parse(localStorage.getItem("currentUser"));

    //adding pass check code here
    var good = true;
    var errorString = "<ul>";
    var pass = $("#newPass").val();
    if (pass.length < 10 || pass.length > 20) {
        errorString += "<li>Password must be between 10 and 20 characters.</li>";
        $("#newPass").css("border", "2px red solid");
        good = false;
    }
    var lower = new RegExp(/[a-z]/)
    if (!(lower.test(pass))) {
        errorString += "<li>Password must contain at least one lowercase character.</li>";
        $("#newPass").css("border", "2px red solid");
        good = false;
    }
    else
        $("#newPass").css("border", "1px #aaa solid");
    var upper = new RegExp(/[A-Z]/)
    if (!(upper.test(pass))) {
        errorString += "<li>Password must contain at least one uppercase character.</li>";
        $("#newPass").css("border", "2px red solid");
        good = false;
    }
    var dig = new RegExp(/\d/)
    if (!(dig.test(pass))) {
        errorString += "<li>Password must contain at least one digit.</li>";
        $("#newPass").css("border", "2px red solid");
        good = false;
    }
    if (pass !== $("#currPassVerif").val()) {
        errorString += "<li>Password and confirmation password don't match.</li>";
        $("#currPassVerif").css("border", "2px red solid");
        good = false;
    }
    errorString += "</ul>";

    if (good) {
        if (!user)
            return;
        var request = { email: user.email, password: $("#currPass").val(), pass: $("#newPass").val() };
        $.ajax({
            type: "POST",
            url: "https://ece513final.tk:3000/home.html/user/passChange",
            headers: request,
            contentType: "application/json",
            response: "application/json"
        }).done(function (data) {
            if (data) {
                localStorage.setItem("currentUser", JSON.stringify(data.person));
                localStorage.setItem("auth", data.auth);
                $("#passh1").text("Successfully Updated Password").css("color", "green");
                setTimeout(function () { $homebtn.trigger("click"); }, 2000);
            }
        }).fail(function (data) {
            $("#passh1").text(data.responseJSON);
            $("#passh1").css("color", "red");
        });
    } else {
        $("#passh1").html(errorString);
        $("#passh1").css("color", "red");
    }
});

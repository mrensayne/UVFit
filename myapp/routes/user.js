var express = require('express');
var User = require('../models/user');
var router = express.Router();
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");
var fs = require('fs');

var secret = fs.readFileSync(__dirname + '/../../../secretkey.txt').toString();


router.post("/register", function (req, res) {
    var noDup = true;

    User.find({ $or: [{ email: req.body.email }, { dev: req.body.dev }] }, function (err, user) {
        if (user.length) {
            noDup = false;
            return res.status(400).json({ success: false, error: "Email or Device already in use" });
        }
        if (noDup) {
            bcrypt.hash(req.body.pass, null, null, function (err, hash) {
                if (err) {
                    console.log("hash failed???");
                    return res.status(500).json(err);
                }
                else {
                    var user = new User({
                        name: req.body.name,
                        email: req.body.email,
                        pass: hash,
                        uvThresh: req.body.uvThresh
                    });
                    user.save(function (err, user) {
                        return res.status(201).send();
                    });
                }
            });
        }
    });
});


router.get("/login", function (req, res) {

    User.findOne({ email: req.query.email }, function (err, user) {
        if (err) {
            res.status(400).send(err);
        } else if (!user) {
            res.status(401).json({ success: false, error: "The email or password provided was invalid." });
        } else {
            bcrypt.compare(req.query.password, user.pass, function (err, valid) {
                if (err) {
                    res.status(401).json({ person: {}, success: false, error: "Error authenticating. Please contact support." });
                }
                else if (valid) {
                    var token = jwt.encode(user, secret);
                    res.status(201).json({ person: user, auth: token, success: true });
                }
                else {
                    res.status(401).json({ success: false, error: "The email or password provided was invalid." });
                }
            });
        }
    });
});
router.get("/account", function (req, res) {
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ success: false, message: "No authentication token" });
    }

    var authToken = req.headers["x-auth"];

    try {
        var decodedToken = jwt.decode(authToken, secret);
        User.findOne({ email: decodedToken.email }, function (err, user) {
            if (err) {
                return res.status(404).json({ success: false, message: "Error Finding User" });
            }
            else {
                if (!user) {
                    return res.status(400).json({ success: false, message: "User does not exist." });
                }
                return res.status(200).json(user);
            }
        });
    }
    catch (ex) {
        return res.status(401).json({ success: false, message: "Invalid authentication token." });
    }
});

function getNewApikey() {
    var newApikey = "";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 32; i++) {
        newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return newApikey;
}

router.post("/update", function (req, res) {
    if (!(req.headers['x-auth'] && req.headers['newuser'])) {
        return res.status(402).json({ success: false, message: "No authentication token" });
    }
    var newUser = JSON.parse(req.headers['newuser']);
    var authToken = req.headers['x-auth'];
    try {
        var decodedToken = jwt.decode(authToken, secret);
        User.findOne({ email: decodedToken.email }, function (err, user) {
            if (err) {
                return res.status(403).json({ success: false, message: "User does not exist." });
            }
            try {
                User.updateOne({ _id: user._id }, { $set: { name: newUser.name, email: newUser.email, uvThresh: newUser.uvThresh, actType: newUser.actType } }).then(result => { return res.status(200).json(user); });
            } catch (e) {
                return res.status(400).json("Failed to update DB");
            }

        });
    } catch (ex) {
        return res.status(401).json({ success: false, message: "Invalid authentication token." });
    }
});


router.post("/device", function (req, res) {
    if (!(req.headers["x-auth"] && req.headers["dev"])) {
        return res.status(401).json({ success: false, message: "No authentication token" });
    }
    var apiKey = getNewApikey();
    var authToken = req.headers["x-auth"];
    var deviceDev = req.headers["dev"];
    try {
        var decodedToken = jwt.decode(authToken, secret);
        User.findOne({ email: decodedToken.email }, function (err, user) {
            if (err) {
                return res.status(400).json({ success: false, message: "User does not exist." });
            }
            else {
                var found = false;
                for (var i = 0; i < user.dev.length; i++) {
                    if (user.dev[i].devID == deviceDev) {
                        return res.status(402).send("Device ID already exists");
                    }

                }
                User.update({ _id: user._id }, { $push: { dev: { devID: deviceDev, devKey: apiKey } } }, function (err, user) {
                    if (err) {
                        return res.status(400).json("Error adding into db");
                    }
                    return res.status(200).send(apiKey);
                });
            }
        });
    }
    catch (ex) {
        return res.status(401).json({ success: false, message: "Invalid authentication token." });
    }
});

router.get("/account/data", function (req, res) {
    if (!req.headers["x-auth"]) {
        return res.status(401).json({ success: false, message: "No authentication token" });
    }

    var authToken = req.headers["x-auth"];

    try {
        var decodedToken = jwt.decode(authToken, secret);
        User.findOne({ email: decodedToken.email }, function (err, user) {
            if (err) {
                return res.status(404).json({ success: false, message: "Error Finding User" });
            }
            else {
                if (!user) {
                    return res.status(400).json({ success: false, message: "User does not exist." });
                }
                return res.status(200).json(user);
            }
        });
    }
    catch (ex) {
        return res.status(401).json({ success: false, message: "Invalid authentication token." });
    }
});

router.get("/DevSettings", function (req, res) {
    console.log(req.query.devID);
    User.findOne({ 'dev.devID': req.query.devID }, function (err, user) {
        if (err) {
            return res.status(500).json("-1");
        }
        if (user === null) {
            return res.status(404).json("-1");
        }
        for (var x = 0; x < user.dev.length; x++) {
            if (user.dev[x].devID == req.query.devID) {//We found the device
                if (user.dev[x].devKey == req.query.apiKey) {// The api key is a match	
                    var tempAct = "";
                    if (user.actType == "Running")
                        tempAct = "1";
                    if (user.actType == "Jogging")
                        tempAct = "2";
                    if (user.actType == "Walking")
                        tempAct = "3";
                    var responseString = tempAct + "," + user.uvThresh;
                    return res.status(200).json(responseString);
                }
            }
        }
        return res.status(403).json("-1");
    });
});

router.delete("/removeDev", function (req, res) {
    if (!req.headers["x-auth"] || !req.headers["zzrot"]) {
        return res.status(401).json({ success: false, message: "No authentication token or Device" });
    }
    var authToken = req.headers["x-auth"];
    var remDev = req.headers["zzrot"];
    try {
        var decodedToken = jwt.decode(authToken, secret);
        User.findOne({ email: decodedToken.email }, function (err, user) {
            if (err) {
                return res.status(404).json({ success: false, message: "Error Finding User" });
            }
            else {
                if (!user) {
                    return res.status(400).json({ success: false, message: "User does not exist." });
                }
                var devNotFoundFlag = true;
                for (var x = 0; x < user.dev.length; x++) {
                    if (user.dev[x].devID == remDev) {
                        devNotFoundFlag = false;
                        console.log(user.dev[x]._id);
                        User.update({ 'dev._id': user.dev[x]._id }, { $pull: { dev: { _id: user.dev[x]._id } } }, function (err, user) {
                            if (err) {
                                return res.status(500).json("MongoDB crashed while updating");
                            }
                            if (user) {
                                return res.status(200).json("Device Removed");
                            }
                            else {
                                return res.status(404).json("User not Found");
                            }
                        });
                    }
                }
                if (devNotFoundFlag) {
                    return res.status(403).json("Device Not Found");
                }
            }
        });
    }
    catch (ex) {
        return res.status(401).json({ success: false, message: "Invalid authentication token." });
    }
});

module.exports = router;

var express = require('express');
var User = require('../models/user');
var Token = require('../models/token');
var router = express.Router();
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");
var fs = require('fs');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

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
                        uvThresh: req.body.uvThresh,
                        actType: req.body.actType
                    });
                    user.save(function (err, user) {
                        if (err) { return res.status(500).json(err); }
                        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
                        token.save(function (err) {
                            if (err) { return res.status(500).json(err); }
                            var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'ece513final@gmail.com', pass: 'eceproject321!' } });
                            console.log(req.body.email);
                            var mailOptions = {
                                from: 'no-reply@uvfit.com',
                                to: req.body.email,
                                subject: 'Account Verification Link',
                                text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttps:\/\/' + req.headers.host + '\/home.html\/user\/confirmation?token=' + token.token + '.\n'
                            };
                            transporter.sendMail(mailOptions, function (err) {
                                if (err) { return res.status(500).json(err); }
                                res.status(201).send();
                            });
                        });
                    });
                }
            });
        }
    });
});


router.get("/login", function (req, res) {
	//not a google user
	if (!req.query.name) {
		console.log("no name, regular login reached");
		
		User.findOne({ email: req.query.email }, function (err, user) {
			if (err) {
				res.status(400).send(err);
			} else if (!user) {
				res.status(401).json({ success: false, error: "The email or password provided was invalid." });
			} else if (!user.isVerified) {
				res.status(401).json({ success: false, error: "Your account has not been verified." });
			} else if (user.isGoogle) {
				res.status(401).json({ success: false, error: "Please log in using Google log in." });
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
	}
	//google login
	else {
		console.log("google log in reached");
		var noDup = true;

		User.find({ email: req.query.email }, function (err, user) {
			if (err) {
				res.status(400).send(err);
			}
			if (user.length) {
				noDup = false;
				console.log("user found");
				//return res.status(400).json({ success: false, error: "Email or Device already in use" });
				var token = jwt.encode(user, secret);
				res.status(201).json({person: user, auth: token, success: true });
			}
			if (noDup) {
				console.log("user creating");
				// bcrypt.hash(req.body.pass, null, null, function (err, hash) {
					// if (err) {
						// console.log("hash failed???");
						// return res.status(500).json(err);
					// }
					// else {
				var user = new User({
					name: req.query.name,
					email: req.query.email,
					uvThresh: 100,
					actType: "NONE",
					isGoogle: true
				});
				user.save(function (err, user) {
					if (err) { return res.status(500).json(err); }
					// var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
					// token.save(function (err) {
						// if (err) { return res.status(500).json(err); }
						// var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'ece513final@gmail.com', pass: 'eceproject321!' } });
						// console.log(req.body.email);
						// var mailOptions = {
							// from: 'no-reply@uvfit.com',
							// to: req.body.email,
							// subject: 'Account Verification Link',
							// text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttps:\/\/' + req.headers.host + '\/home.html\/user\/confirmation?token=' + token.token + '.\n'
						// };
						// transporter.sendMail(mailOptions, function (err) {
							// if (err) { return res.status(500).json(err); }
					console.log("user saved");
					res.status(201).send();
						// });
					// });
				});
					// }
				// });
			}
		});
	}
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
                User.updateOne({ _id: user._id }, { $set: { name: newUser.name, email: newUser.email, uvThresh: newUser.uvThresh, actType: newUser.actType } }).then(result => {
                    User.findOne({ _id: user._id }, function (err, finaluser) {
                        if (err) {
                            return res.status(505).json("Error when getting final user");
                        }
                        if (finaluser) {
                            var token = jwt.encode(finaluser, secret);
                            res.status(200).json({ 'user': finaluser, auth: token });
                        }
                    });
                });
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

//we need is a lat and long degree from user and thats it
router.get("/users", function (req, res) {
    console.log("grabbing local");
    User.find({}, function (err, users) {
        if (err) {
            return res.status(500).json('error in db');
        }
        if (users) {
            return res.status(200).json(users);
        }
        return res.status(404).json("No users found");
    });
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
                    if (user.actType == "Auto" || user.actType == "NONE")
                        tempAct = "0";
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

//We need the Activity ID along with The Act Type and Email of User [ eventID, email, actType] : Returns new auth token and the user
router.get("/ChangeAct", function (req, res) {
    console.log(req.query);
    User.findOne({ 'email': req.query.email }, function (err, user) {
        if (err) {
            return res.status(500).json("-1");
        }
        if (!user) {
            return res.status(404).json("-1");
        }
        for (var x = 0; x < user.activities.length; x++) {
            if (user.activities[x].eventID == req.query.eventID) {
                user.activities[x].actTypeAct = req.query.actType;
                if (req.query.actType == "Walking") {
                    user.activities[x].calories = JSON.parse(user.activities[x].speed)[0] * .1864; //assuming user weight of 200, taken from https://www.runnersworld.com/nutrition-weight-loss/a20825897/how-many-calories-are-you-really-burning-0/	
                }
                else if (req.query.actType == "Running") {
                    //.3914 is in units [(calorie*second)/(meter) and speedArray is in units (meters/second)]
                    user.activities[x].calories = JSON.parse(user.activities[x].speed)[0] * .3914; //assuming user weight of 200, taken from https://www.runnersworld.com/nutrition-weight-loss/a20825897/how-many-calories-are-you-really-burning-0/	
                }
                else {
                    //.2114 is in units [(calorie*second)/(meter) and speedArray is in units (meters/second)]
                    user.activities[x].calories = JSON.parse(user.activities[x].speed)[0] * .2114; //assuming user weight of 200, taken from https://www.runnersworld.com/nutrition-weight-loss/a20825897/how-many-calories-are-you-really-burning-0/	
                }
            }
        }
        try {
            user.save(function (err, user) {
                if (err)
                    return res.status(501).json("error saving into dB");
                var token = jwt.encode(user, secret);
                return res.status(200).json({ 'auth': token, 'user': user });
            });
        } catch (ex) {
            return res.status(502).json("Error saving or generating token");
        }  
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

router.post("/passChange", function (req, res) {
    console.log("In Pass");
    if (!req.headers["email"] || !req.headers["password"] || !req.headers["pass"]) {
        return res.status(501).json("Missing Data");
    }
    var email = req.headers["email"];
    var password = req.headers["password"];
    var pass = req.headers["pass"];
    User.findOne({ email: email }, function (err, user) {
        if (err) {
            res.status(500).send(err);
        }
        else if (!user) {
            res.status(401).json({ success: false, error: "The email or password provided was invalid." });
        }
        else {
            bcrypt.compare(password, user.pass, function (err, valid) {
                if (err) {
                    res.status(401).json({ person: {}, success: false, error: "Error authenticating. Please contact support." });
                }
                else if (valid) {
                    bcrypt.hash(pass, null, null, function (err, hash) {
                        User.update({ _id: user._id }, { $set: { pass: hash } }, function (err, userx) {
                            if (err) {
                                return res.status(500).json("Error in DB update");
                            }
                            if (userx) {
                                User.findOne({ email: email }, function (err, usery) {
                                    return res.status(200).json({ person: usery, auth: jwt.encode(usery, secret) });
                                })
                            }
                        })

                    });
                }
                else {
                    return res.status(403).json("Invalid Email Or Password");
                }
            });
        }
    });
});

router.get('/confirmation', function (req, res) {
    console.log("got to confirmation");
    Token.findOne({ token: req.query.token }, function (err, token) {
        if (!token) {
            console.log("token not found");
            return res.status(400).json({ success: false, error: "Invalid Token. Your token may have expired." });
        }
        User.findOne({ _id: token._userId }, function (err, user) {
            if (!user) {
                console.log("user not found");
                return res.status(400).json({ success: false, error: "User not found for this token." });
            }
            if (user.isVerified) {
                return res.status(400).json({ success: false, error: "User has already been verified." });
            }
            user.isVerified = true;
            user.save(function (err) {
                if (err) {
                    return res.status(500).json({ success: false, error: "Internal MongoDB error." });
                }
                //res.status(200).send({success: true, error: "The account has been verified. Please log in."});
                return res.redirect("/home.html");
            });
        });
    });
});

router.post("/resend", function (req, res) {

});

module.exports = router;
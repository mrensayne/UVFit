var express = require('express');
var User = require('../models/user');
var router = express.Router();

router.post("/", function(req, res) {
	var apiKeyFail = false;
	User.findOne({ 'dev.devID': req.body.a }, function(err, user) {
		if (err) {
			return res.status(500).json("Error searching through DB");
		}
		if (user) {
			var speedArray = JSON.parse(req.body.e);
			var cal = speedArray[0] * req.body.y * 200 * 0.63; //assuming user weight of 200, taken from https://www.runnersworld.com/nutrition-weight-loss/a20825897/how-many-calories-are-you-really-burning-0/				
			for (var i = 0; i < user.dev.length; i++) {
				if (user.dev[i].devKey == req.body.apikey) {
					//console.log(req.body);
					if (req.body.z == "Auto") 
					{ //no acitivty type specified
						var act = "";
						if (speedArray[0] < 5) act = "Walking";
						else if (speedArray[0] < 10) act = "Running";
						else act = "Biking";
						var activ = { eventTime: req.body.x, eventDuration : req.body.y, eventID : req.body.f, deviceID : req.body.a, longitude : req.body.b, latitude : req.body.c, UV : req.body.d, speed : req.body.e, actTypeAct : act , calories : cal };
						console.log(activ);
						User.update({ _id: user._id }, { $push: { activities: activ }  }, function(err, user) {
							if (err) {
								return res.status(500).json("Error adding into db");
							}
							console.log("Event Added!");
							return res.status(200).json("Event Added!");
						});
					}
					else {
						User.update({ _id: user._id }, { $push: { activities: {eventTime: req.body.x, eventDuration : req.body.y, eventID : req.body.f, deviceID : req.body.a, longitude : req.body.b, latitude : req.body.c, UV : req.body.d, speed : req.body.e, actTypeAct : req.body.z, calories : cal } } }, function(err, user) {
							if (err) {
								return res.status(500).json("Error adding into db");
							}
							return res.status(200).json("Event Added!");
						});
					}
				}
			}
		}
		else {
			return res.status(404).json("Device not found in DB");
		}
	});
});

router.get("/ping", function(req, res){
	console.log(req.query.ping);
	return res.status(200).json("ACK");
});

module.exports = router;
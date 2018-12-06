var db = require("../db");

var User = db.model("user", {
    name: String,
    email: { type: String, unique: true },
    pass: String,
    uvThresh: Number,
    actType: String,
    dev: [{
        devID: String,
        devKey: String
    }],
    activities: [{
	actTypeAct: String,
	deviceID: String,
	eventTime: String,
	eventDuration: Number,
	eventID: String,
        longitude: [String],
        latitude: [String],
        UV: [String],
        speed: [String],
        calories: Number
    }],
    isVerified: { type: Boolean, default: false }
});

module.exports = User;

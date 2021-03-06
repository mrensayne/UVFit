var db = require("../db");

var User = db.model("user", {
    name: String,
    email: { type: String, unique: true },
    pass: String,
    uvThresh: { type:Number, default: 100},
    actType: { type: String, default: 'NONE'},
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

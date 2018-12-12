var db = require("../db");

var Token = db.model("token", {
    _userId: { type: db.Schema.Types.ObjectId, required: true,
              ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 3600}
});

//var Token = db.model("Token", tokenSchema);

module.exports = Token;

var mongoose = require("mongoose");
mongoose.connect("mongodb+srv://ECEProjectUser:eceproject321!@eceprojectdb-popwv.mongodb.net/ProjDB?retryWrites=true", { useNewUrlParser: true });

mongoose.connection.once('open', function(){
console.log('Connection to MangoDB->ECEProjectDB successful');
}).on('error', function(error){
console.log('Connection error: ', error);
});

module.exports = mongoose;
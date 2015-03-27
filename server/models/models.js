var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
	username: String,
	password: String, //hash created from password
	githubId: String,
	created_at: {type: Date, default: Date.now}
})

mongoose.model('User', userSchema);

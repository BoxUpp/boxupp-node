var express = require('express');
var router = express.Router();
var util = require('util');
var auth = function(req, res, next){
	console.log("user details: ");
	 console.log(util.inspect(req));
	if (!req.isAuthenticated()) {
		res.status(401);
		res.end();
		} else{
			next();
}};
//var auth = function(req, res, next){ console.log("sss"); next(); };
router.get('/b',auth, function(req, res){
		console.log("b blog called");
		res.send(200);
	});

	//log in
	router.post('/a',auth,function(req,res){
		console.log("a blog called");
		res.send(200);
	});
	module.exports = router;
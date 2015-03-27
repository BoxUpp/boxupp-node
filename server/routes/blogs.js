var express = require('express');
var router = express.Router();
console.log("2");

router.get('/b', function(req, res){
		console.log("b blog called");
		res.send(200);
	});

	//log in
	router.post('/a',function(req,res){
		console.log("a blog called");
		res.send(200);
	});

	module.exports = router;
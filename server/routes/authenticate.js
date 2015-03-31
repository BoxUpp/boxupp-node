	/**
	 * All routes to login, sign-up, github login.
	 * Path : /auth/
	 *@requires express
	 *@class Authenticate
	 *@static
	 */
var express = require('express');
var router = express.Router();
/** export........*/
module.exports = function(passport){

	/**
	 * sends successful login state back to angular
	@method auth/success
	*/
	router.get('/success', function(req, res){
		console.log("inside success");
		console.log("session info: "+JSON.stringify(req.session));
		res.send({state: 'success', user: req.user ? req.user : null});
	});

	/**
	 * sends failure login state back to angular
	@method auth/failure
	*/
	router.get('/failure', function(req, res){
		res.send({state: 'failure', user: null, message: "Invalid username or password"});
	});

	/**
	 * Log in
	@method auth/login
	*/
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failure'
	}));

	/**
	 * Sign Up
	@method auth/signup
	*/
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failure'
	}));

	/**
	 * Sign up using github
	@method auth/github
	*/
	router.get('/github', passport.authenticate('github'));

	router.get('/github/callback', 
			passport.authenticate('github', { 
				successRedirect: '/auth/success',
				failureRedirect: '/auth/failure' 
			}));

	/**
	 * Sign out
	@method auth/sigout
	*/
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;

}
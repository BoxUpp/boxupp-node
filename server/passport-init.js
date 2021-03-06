	/**
	 * Passport is authentication middleware for Node.js.
	 * A comprehensive set of strategies support authentication using a username and password, Facebook, Twitter, Github, and more.
	 * Models used : User
	 *@requires passport,mongoose,bCrypt,log4js,passport-local,passport-github,acl
	 *@class Passport-initialization
	 *@static
	 */
var mongoose = require('mongoose');   
var User = mongoose.model('User');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var acl = require('acl');
var GitHubStrategy   = require('passport-github').Strategy;
var log4js = require('log4js');
var log = log4js.getLogger("auth");
log4js.configure('./config/log4js.json');

module.exports = function(passport){
	/**
	 * Passport needs to be able to serialize and de-serialize users to support persistent login sessions
	@method passport.serializeUser()
	*/ 
	passport.serializeUser(function(user, done) {
		console.log('serializing user:',user.username);
		done(null, user._id);
	});
	/**
	 * Passport needs to be able to serialize and de-serialize users to support persistent login sessions
	@method passport.deserializeUser()
	*/ 
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			console.log('deserializing user:',user.username);
			if(err){
				log.error(err);
				}
			done(err, user);
		});
	});
	/**
	 * Local Strategy for logging in users. Local Strategy means the user who have signed up without any third party provider.
	 * Check for user in database and if find one, then matches the password. If both match, return user, which will be treated like success.
	@method passport.use('login', new LocalStrategy())
	*/ 
	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done) {
			// check in mongo if a user with username exists or not
			User.findOne({ 'username' :  username }, 
				function(err, user) {
					// In case of any error, return using the done method
					if (err){			
						log.error(err);
						return done(err);}
					// Username does not exist, log the error and redirect back
					if (!user){
						console.log('User Not Found with username '+username);
						return done(null, false);                 
					}
					// User exists but wrong password, log the error 
					if (!isValidPassword(user, password)){
						console.log('Invalid Password');
						return done(null, false); // redirect back to login page
					}
					// User and password both match, return user from done method
					// which will be treated like success
					//req.session.userId = user._id;
					return done(null, user);
				}
			);
		}
	));
	/**
	 * Local Strategy for signing up users. Local Strategy means the user are signing up without any third party provider.
	  * Check for user in database and if find one, then send 'User already exist', otherwise create one.
	@method passport.use('signup', new LocalStrategy())
	*/ 
	passport.use('signup', new LocalStrategy({
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, username, password, done) {

			// find a user in mongo with provided username
			User.findOne({ 'username' :  username }, function(err, user) {
				// In case of any error, return using the done method
				if (err){
					log.error(err);
					console.log('Error in SignUp: '+err);
					return done(err);
				}
				// already exists
				if (user) {
					console.log('User already exists with username: '+username);
					return done(null, false);
				} else {
					// if there is no user, create the user
					var newUser = new User();

					// set the user's local credentials
					newUser.username = username;
					newUser.password = createHash(password);

					// save the user
					newUser.save(function(err,user) {
						if (err){
							log.error(err);  
							throw err;  
						}
						acl = new acl(new acl.mongodbBackend(mongoose.connection.db,'_acl'));
						console.log(user.username + ' Registration succesful');    
						acl.addUserRoles(user._id.toString(), 'user', function(err){							
						console.log("setting role = user  error"+err);
						});
						
						return done(null, newUser);
					});
				}
			});
		})
	);

	/**
	 * Signup/Login user with Github.
	 * Redirect the user to github and upon success, check the user in database. If it does not exist, then create one.
	@method passport.use(new GitHubStrategy())
	*/ 	
	passport.use(new GitHubStrategy({
			clientID: 'dcda0273cfd203abe900',
			clientSecret: 'e8fd3b7fab884a3b9e0ae237c5cdd488c46287af'
			//callbackURL: "http://localhost:3000/auth/github/callback"
		},
	  function(accessToken, refreshToken, profile, done) {
			 User.findOne({
            'githubId': profile.id 
        }, function(err, user) {
            if (err) {
				log.error(err);
                return done(err);
            }
            //No user was found... so create a new user with values from Facebook (all the profile. stuff)
            if (!user) {
                user = new User({
                   // username: profile.displayName,
                    //email: profile.emails[0].value,
                    username: profile.username,
                  //  provider: 'github',
                    githubId: profile.id
                });
                user.save(function(err) {
                    if (err) {
						log.error(err);
						console.log(err);
					}
                    return done(err, user);
                });
            } else {
                //found user. Return
				
                return done(err, user);
            }
        });
	  }
	));
	
	/**
	 * Compare the password entered by user with the password(encrypted) saved in database.
	@method isValidPassword
	@param user {Object} user object from database (whose user name is matched).
	@param password {String} Password entered by user
	@return true, if the password match, else false.
	*/ 
	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	};
	// Generates hash using bCrypt
	/**
	 * Generates hash for password using bCrypt
	@method createHash
	@param password {String} Password entered by user.
	@return hash for password.
	*/ 
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

};

var mongoose = require('mongoose');   
var User = mongoose.model('User');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var acl = require('acl');
var mongoose = require('mongoose');
var GitHubStrategy   = require('passport-github').Strategy;

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser(function(user, done) {
		console.log('serializing user:',user.username);
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			console.log('deserializing user:',user.username);
			done(err, user);
		});
	});

	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done) { 
			// check in mongo if a user with username exists or not
			User.findOne({ 'username' :  username }, 
				function(err, user) {
					// In case of any error, return using the done method
					if (err)
						return done(err);
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
					return done(null, user);
				}
			);
		}
	));

	passport.use('signup', new LocalStrategy({
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, username, password, done) {

			// find a user in mongo with provided username
			User.findOne({ 'username' :  username }, function(err, user) {
				// In case of any error, return using the done method
				if (err){
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
					newUser.save(function(err) {
						if (err){
							console.log('Error in Saving user: '+err);  
							throw err;  
						}
						acl = new acl(new acl.mongodbBackend(mongoose.connection.db));
						console.log("here");

						console.log(newUser.username + ' Registration succesful');    
						acl.addUserRoles( newUser.username, 'user', function(err){
						console.log("setting role = user");
						});
						return done(null, newUser);
					});
				}
			});
		})
	);
	
	passport.use(new GitHubStrategy({
			clientID: 'dcda0273cfd203abe900',
			clientSecret: 'e8fd3b7fab884a3b9e0ae237c5cdd488c46287af',
			callbackURL: "http://localhost:3000/auth/github/callback"
		},
	  function(accessToken, refreshToken, profile, done) {
			 User.findOne({
            'githubId': profile.id 
        }, function(err, user) {
            if (err) {
                return done(err);
            }
			console.log("user details: "+JSON.stringify(profile));
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
                    if (err) console.log(err);
                    return done(err, user);
                });
            } else {
                //found user. Return
                return done(err, user);
            }
        });
	  }
	));
	

	
	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	};
	// Generates hash using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

};

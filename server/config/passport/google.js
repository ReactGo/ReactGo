var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models').User;
var secrets = require('../secrets');

/*
 * OAuth Strategy taken modified from https://github.com/sahat/hackathon-starter/blob/master/config/passport.js
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 *
 * The Google OAuth 2.0 authentication strategy authenticates users using a Google account and OAuth 2.0 tokens. 
 * The strategy requires a verify callback, which accepts these credentials and calls done providing a user, as well
 * as options specifying a client ID, client secret, and callback URL.
 */
module.exports = new GoogleStrategy({
	clientID: secrets.google.clientID,
	clientSecret: secrets.google.clientSecret,
	callbackURL: secrets.google.callbackURL
}, function(req, accessToken, refreshToken, profile, done) {
	if (req.user) {
		User.findOne({ where: { google: profile.id } }).then(function(existingUser) {
			if (existingUser) {
				return done(null, false, { message: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.'});
			} else {
				User.findById(req.user.id, function(err, user) {
					user.google = profile.id;
					user.tokens.push({ kind: 'google', accessToken: accessToken});
					user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || profile._json.picture;
          user.save(function(err) {
            done(err, user, { message: 'Google account has been linked.' });
          });
				});
			}
		}).error(function(err) {
      return done(null, false, { message: 'Something went wrong trying to authenticate'});
    });
	} else {
		User.findOne({ where: { google: profile.id } }).then(function(existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({ where: { email: profile._json.emails[0].value } }).then(function(existingEmailUser) {
        if (existingEmailUser) {
          return done(null, false, { message: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.'});
        } else {
          User.create({
            email: profile._json.emails[0].value,
            // TODO: inspect this profile.id field and add it to the db
            google: profile.id,
            name: profile.displayName,
            gender: profile._json.gender,
            picture: profile._json.picture
          }).then(function(user) {
            done(null, user);
          }).error(function(err) {
            done(err, null);
          });
          // TODO: have to create a token
          //user.tokens.push({ kind: 'google', accessToken: accessToken });
        }
      }).error(function(err) {
        return done(null, false, { message: 'Something went wrong trying to authenticate'});
      });
    }).error(function(err) {
      return done(null, false, { message: 'Something went wrong trying to authenticate'});
    });
	}
});

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email,
          avatar: profile.photos?.[0]?.value,
          provider: 'google',
          providerId: profile.id
        });
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
} else {
  console.warn('Google login skipped: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set.');
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'emails', 'photos']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || `${profile.id}@facebook.placeholder`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email,
          avatar: profile.photos?.[0]?.value,
          provider: 'facebook',
          providerId: profile.id
        });
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
} else {
  console.warn('Facebook login skipped: FACEBOOK_APP_ID / FACEBOOK_APP_SECRET not set.');
}

module.exports = passport;

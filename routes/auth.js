const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();

function issueToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
  (req, res) => {
    const token = issueToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login-failed' }),
  (req, res) => {
    const token = issueToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const token = header.replace('Bearer ', '');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

module.exports = router;
module.exports.requireAuth = requireAuth;

const { Router } = require("express");
const signup = Router();
const User = require("../db/user");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { default: validate } = require("deep-email-validator");
require('dotenv').config();

signup.use((req, res, next) => {
  if (req.user) res.redirect('/')
  else next()
})

signup.get('/', (req, res, next) => {
  res.render('signup', { message: '' })
});

signup.post('/', async (req, res, next) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    const existingExistence = await validate(email);

    if (existingUser || existingExistence.valid) {
      return res.render('signup', { message: 'Email is not valid' });
    }

    const saltRounds = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const newUser = new User({
      username,
      password: hashedPassword,
      email
    });

    await newUser.save();
    req.id = newUser._id;
    next()
  } catch (error) {
    console.error('Error during registration', error);
    res.render('signup', { message: 'Server error' });
  }
}, (req, res, next) => {
  const token = jwt.sign({ id: req.id }, process.env.JWT_SEC, { expiresIn: '72h' });

  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000 * 72
  });
  res.redirect('/user?message=User signed up succesfully');
});

module.exports = signup;
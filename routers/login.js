const { Router } = require("express")
const login = Router();
const bcrypt = require("bcrypt");
const User = require("../db/user");
const jwt = require('jsonwebtoken');
require('dotenv').config();

login.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.redirect("/login");
});

login.use((req, res, next) => {
  if (req.user) res.redirect('/user')
  else next()
})

login.get('/', (req, res, next) => {
  res.render('login', { message: '' })
});

login.post('/', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return setTimeout(() => {
        res.render('login', { message: 'User is not found' });
      }, 10000 * (0.5 + (Math.random() * 0.5)))
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return setTimeout(() => {
        res.render('login', { message: 'Password is incorrect' });
      }, 10000 * (0.5 + (Math.random() * 0.5)))
    }
    req.id = user._id;
    next();
  } catch (error) {
    setTimeout(() => {
      console.error('Error during login', error);
      res.render('login', { message: 'Server error' });
    }, 10000 * (0.5 + (Math.random() * 0.5)))
  }
}, (req, res, next) => {
  const token = jwt.sign({ id: req.id }, process.env.JWT_SEC, { expiresIn: '72h' });

  setTimeout(() => {
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 * 72
    });
    res.redirect('/user?message=User logged in succesfully');
  }, 10000 * (0.5 + (Math.random() * 0.5)))
});

module.exports = login
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

// Load User model
require('../models/User');
const User = mongoose.model('users');

// User login route
router.get('/login', (req, res) => {
	res.render('users/login');
});

// User register route
router.get('/register', (req, res) => {
	res.render('users/register');
});

// User login post route
router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/ideas',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

// User register post route
router.post('/register', (req, res) => {
	const errors = [];

	if (req.body.password !== req.body.confirm_password) {
		errors.push({text: 'Passwords do not match.'});
	}
	
	if (req.body.password.length < 4) {
		errors.push({text: 'Password must be at least 4 characters.'});
	}

	if (!req.body.name) {
		errors.push({text: 'Please enter your name.'});
	}

	if (!req.body.email) {
		errors.push({text: 'Please enter your email.'});
	}

	if (errors.length > 0) {
		res.render('users/register', {
			errors,
			name: req.body.name,
			email: req.body.email
		});
	} else {
		User.findOne({email: req.body.email})
			.then(user => {
				if (user) {
					req.flash('error_msg', 'Email already exists, try different one!');
					res.redirect('/users/register');
				} else {
					const newUser = new User({
						name: req.body.name,
						email: req.body.email,
						password: req.body.password
					});

					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(newUser.password, salt, (err, hash) => {
							if (err) throw err;
							newUser.password = hash;

							newUser.save()
								.then(user => {
									req.flash('success_msg', 'Registration complete now you can login');
									res.redirect('/users/login');
								}).catch(err => {
								console.log(err);
								return;
							});
						});
					});
				}
			});
	}
});

// Logout route
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
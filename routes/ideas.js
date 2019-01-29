const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');

// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

// Get ideas from db
router.get('/', ensureAuthenticated, (req, res) => {
	Idea.find({user: req.user.id})
		.sort({date: 'desc'})
		.then(ideas => {
			res.render('ideas/index', {
				ideas
			});
		});
});

// Add ideas form route
router.get('/add', ensureAuthenticated, (req, res) => {
	res.render('ideas/add');
});

// Add ideas post route
router.post('/', ensureAuthenticated, (req, res) => {
	let errors = [];

	if (!req.body.title) {
		errors.push({text:'Please fill the title field'});
	}

	if (!req.body.details) {
		errors.push({text:'Please fill the details field'});
	}

	if (errors.length > 0) {
		res.render('ideas/add', {
			errors,
			title: req.body.title,
			details: req.body.details
		});
	} else {
		const newUser = {
			title: req.body.title,
			details: req.body.details,
			user: req.user.id
		};

		new Idea(newUser)
			.save()
			.then((idea) => {
				req.flash('success_msg', 'Idea successfully saved!');
				res.redirect('/ideas');
			});
	}
});

// Get idea form db by id
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Idea.findById({
		_id: req.params.id
	}).then(idea => {
		if (idea.user != req.user.id) {
			req.flash('error_msg', 'You are not authorized to edit this idea!');
			res.redirect('/ideas');
		} else {
			res.render('ideas/edit', {
				idea
			});
		}
	});
});

// Submit put request by id
router.put('/edit/:id', ensureAuthenticated, (req, res) => {
	Idea.findById({
		_id: req.params.id
	})
		.then(idea => {
			// New Value
			idea.title = req.body.title;
			idea.details = req.body.details;

			idea.save()
				.then(idea => {
					req.flash('success_msg', 'Idea edited successfully!');
					res.redirect('/ideas');
				})
		})
});

// Delete idea by id
router.delete('/delete/:id', ensureAuthenticated, (req, res) => {
	Idea.remove({
		_id: req.params.id
	}).then(idea => {
		req.flash('success_msg', 'Idea successfully removed!');
		res.redirect('/ideas');
	})
});

module.exports = router;
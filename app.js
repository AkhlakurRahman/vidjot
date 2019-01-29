const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();

// Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport
require('./config/passport')(passport);

// Map global promise - to get rid of deprecation warning
mongoose.Promise = global.Promise;

// Connected to mongoDB database
mongoose.connect('mongodb://localhost:27017/VidJot', {
	useNewUrlParser: true
}).then(() => {
	console.log('Connected to MongoDB.');
}).catch((err) => {
	console.log(err);
});

app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method Override middleware
app.use(methodOverride('_method'));

// Express-session middleware
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash middleware
app.use(flash());

// Flash global variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

// Home route
app.get('/', (req, res) => {
	res.render('index', {
		title: 'Welcome'
	});
});

// About route
app.get('/about', (req, res) => {
	res.render('about');
});

// Use routes
app.use('/ideas', ideas);
app.use('/users', users);

const port = 3000;
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
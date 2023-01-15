const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

var crypto = require('crypto');

const rateLimit = require('express-rate-limit');

const app = express();

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
	message: 'Too many login attempts (more than 10), please try again after 15 minutes.',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

let passwordExpiration;

app.use('/auth', apiLimiter);

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'GDPR'
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	let hash = crypto.createHash('sha256').update(password).digest('hex');
	let lastPasswordChange;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, hash], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				connection.query('INSERT INTO logging (message) VALUES ("Successful login")');
				// Redirect to home page
				response.redirect('/home');
				let timestampQuery = connection.query("SELECT last_password_change FROM users WHERE username = ?", [username], function(err, results, fields) {
  					if (err) throw err;
  					lastPasswordChange = results[0].last_password_change;
					const now = new Date();
					const passwordAge = now - new Date(lastPasswordChange);
					if (passwordAge > 1000 * 60 * 60 * 24 * 30.44) { //Threshold: 1 month
						passwordExpiration = true;
					}
					//connection.end();
				});
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin && !passwordExpiration) {
		// Output username
		response.send('Welcome back, ' + request.session.username + '!');
	}
	else if (request.session.loggedin && passwordExpiration) {
		response.send('Please change your password!');
	}
	else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});



app.listen(3000);

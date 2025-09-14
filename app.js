// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
// const DatabaseConnection = require('../models/DatabaseConnection');

const mainRoutes = require('./routes/mainRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Session Configuration
app.use(session({
    secret: 'a-very-secret-key-for-your-app-change-me',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// EJS View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse request bodies
app.use(express.json()); // For API requests like the shell
app.use(express.urlencoded({ extended: true })); // For form submissions (login/signup)

// Serve static files (CSS, client-side JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use the defined route handlers
const apiRoutes = require('./routes/apiRoutes');
app.use('/', authRoutes);
app.use('/', mainRoutes);
app.use('/api/v1', apiRoutes); 

app.listen(PORT, () => {
    console.log(`Server is running in Varanasi on http://localhost:${PORT}`);
});
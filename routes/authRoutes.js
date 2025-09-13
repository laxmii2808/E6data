const express = require('express');
const router = express.Router();
const users = [];
router.get('/signup', (req, res) => {
    res.render('auth/signup');
});

router.post('/signup', (req, res) => {
    const { email, password } = req.body;
    users.push({ email, password }); 
    console.log('Current Users:', users);
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        req.session.userId = user.email; // Store user identifier in session
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

module.exports = router;
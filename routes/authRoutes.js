const express = require('express');
const router = express.Router();
const axios = require('axios'); // Ensure axios is imported

router.get('/signup', (req, res) => {
    res.render('auth/signup', { page: 'signup', error: null });
});

router.post('/signup', async (req, res) => {
    try {
        const { name, email, age, password } = req.body;
        const payload = {
            name,
            email,
            age: Number(age),
            password
        };
        const response = await axios.post(
            "https://hackathon-backend-vwzw.onrender.com/api/auth/user",
            payload
        );
        console.log(response.data);
        if (response.status !== 201 && response.status !== 200) throw new Error("Signup failed");
        res.redirect('/login');
    } catch (err) {
        res.render('auth/signup', { page: 'signup', error: err.message });
    }
});

router.get('/login', (req, res) => {
    res.render('auth/login', { page: 'login' });
});

router.post('/login', async (req, res) => {
    try {
        console.log("making request");
        const response = await axios.post(
            "https://hackathon-backend-vwzw.onrender.com/api/auth/login",
            req.body 
        );
        console.log(response.data);
        if (response.data && response.data.success) {
            req.session.userId = req.body.email;
            res.redirect('/dashboard');
        } else {
            res.render('auth/login', { page: 'login', error: 'Invalid credentials' });
        }
    } catch (err) {
        res.render('auth/login', { page: 'login', error: 'Login failed. Try again.' });
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
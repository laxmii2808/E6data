const express = require('express');
const router = express.Router();
router.get('/signup', (req, res) => {
    res.render('auth/signup', { page: 'signup' });
});

router.post('/signup', async (req, res) => {
    try {
        const payload = {
            ...req.body,
            age: Number(req.body.age)
        };
        const response = await fetch(
            "https://hackathon-backend-vwzw.onrender.com/api/auth/user",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
        );
        if (!response.ok) throw new Error("Signup failed");
        res.redirect('/login');
    } catch (err) {
        res.render('auth/signup', { page: 'signup', error: 'Signup failed. Try again.' });
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
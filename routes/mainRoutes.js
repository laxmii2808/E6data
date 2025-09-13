// routes/mainRoutes.js
const express = require('express');
const router = express.Router();

// =================================================================
//  1. MIDDLEWARE AND DATA HELPERS
// =================================================================

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/login');
    }
};

const mockDB = {
    users: [
        { id: 1, name: "Aarav", city: "Varanasi", active: true },
        { id: 2, name: "Bhavna", city: "Delhi", active: false },
        { id: 3, name: "Chetan", city: "Varanasi", active: true },
        { id: 4, name: "Divya", city: "Mumbai", active: true },
    ],
    products: [
        { id: 101, name: "Silk Saree", category: "Apparel", stock: 15 },
        { id: 102, name: "Wireless Earbuds", category: "Electronics", stock: 50 },
    ]
};

function executeQuery(command) {
    const findRegex = /^(\w+)\.find\((.*)\)$/;
    const match = command.match(findRegex);
    if (!match) { throw new Error("Invalid command. Use 'collection.find()'."); }
    const collectionName = match[1];
    const queryStr = match[2].trim();
    if (!mockDB[collectionName]) { throw new Error(`Collection '${collectionName}' not found.`); }
    let data = mockDB[collectionName];
    if (queryStr) {
        try {
            const query = JSON.parse(queryStr);
            return data.filter(item => Object.keys(query).every(key => item[key] === query[key]));
        } catch (e) { throw new Error("Invalid JSON in query."); }
    }
    return data;
}

// =================================================================
//  2. PUBLIC ROUTES (No login required)
// =================================================================

router.get('/', (req, res) => {
    res.render('pages/home');
});

// =================================================================
//  3. PROTECTED ROUTES (Login is required)
// =================================================================

router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('layout', {
        body: 'pages/dashboard', title: 'Dashboard', page: 'dashboard', user: req.session.userId
    });
});

router.get('/shell', isAuthenticated, (req, res) => {
    res.render('layout', {
        body: 'pages/shell', title: 'Query Shell', page: 'shell', user: req.session.userId
    });
});

router.post('/api/execute', isAuthenticated, (req, res) => {
    const { command } = req.body;
    if (!command) { return res.status(400).json({ error: "Command cannot be empty." }); }
    try {
        const result = executeQuery(command);
        res.json({ result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
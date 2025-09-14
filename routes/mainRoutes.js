// routes/mainRoutes.js
const express = require('express');
const router = express.Router();

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

router.get('/', (req, res) => {
    res.render('pages/home', { layout: false });
});

router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('pages/dashboard', {
        title: 'Dashboard',
        page: 'dashboard',
        user: req.user.email 
    });
});

router.get('/shell', isAuthenticated, (req, res) => {
    res.render('pages/shell', {
        title: 'Query Shell', 
        page: 'shell',
        user: req.user.email
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
router.post('/api/simulate/connection', isAuthenticated, (req, res) => {
    const { connectionName, databaseType, host } = req.body;

    if (!connectionName || !databaseType || !host) {
        return res.status(400).json({ 
            success: false,
            message: "Missing required fields"
        });
    }

    const dynamicResponse = {
        success: true,
        message: `Connection named '${connectionName}' was created successfully.`,
        data: {
            connectionId: "64a1b2c3d4e5f6789012345",
            connectionName: connectionName,
            status: "connected",
            requestDetails: {
                databaseTypeReceived: databaseType,
                hostReceived: host
            },
            metadata: {
                collections: ["users", "products", "logs"],
                indexes: ["_id_", "email_1"]
            }
        }
    };
    res.status(201).json(dynamicResponse);
});
router.get('/simulator', isAuthenticated, (req, res) => {
    res.render('pages/simulator', {
        title: 'API Simulator',
        page: 'simulator',
        user: req.user ? req.user.email : req.session.userId
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();

const {
    getAllProducts,
    getAvailableProducts,
} = require('../db/products');
const {
    buildHomePage,
    buildPasswordPage,
    buildOrderSuccessPage
} = require('../services/pageBuilder');

const SETTINGS = require('../services/settings');

function requireAuth(req, res, next) {
    if (req.session.authenticated || SETTINGS.get('PASSWORD_PROTECTION') == false) return next();
    res.status(403).send(buildPasswordPage());
}

router.post('/login', (req, res) => {
    const { password } = req.body;

    if (password === SETTINGS.get('SITE_PASSWORD')) {
        req.session.authenticated = true;
        return res.redirect('/');
    }

    res.status(401).send('Wrong password');
})

router.get('/', requireAuth, (req, res) => {
    res.send(buildHomePage(getAvailableProducts()));
});

router.get('/order/:id', (req, res) => {
    res.send(buildOrderSuccessPage(req.params.id));
});

module.exports = router;
const express = require('express');
const path = require('path');
const router = express.Router();

const {
    getProductById
} = require('../db/products');
const {
    buildProductPage,
    build404Page,
    buildPasswordPage
} = require('../services/pageBuilder');

const SETTINGS = require('../services/settings');

function requireAuth(req, res, next) {
    if (req.session.authenticated || SETTINGS.get('PASSWORD_PROTECTION') == false) return next();
    res.status(403).send(buildPasswordPage());
}

router.get(/^\/[^\/]+$/, requireAuth,(req, res) => {
    const id = req.url.slice(1);
    const product = getProductById(id);

    if (!product) {
        if(id === 'admin') return res.redirect('/admin/password');
        return res.status(404).send(build404Page());
    }

    res.send(buildProductPage(product));
});

module.exports = router;
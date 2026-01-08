const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getProductById,

} = require('../db/products');

const {
    buildPasswordPage,
    buildAdminPage
} = require('../services/pageBuilder');

function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    res.status(403).redirect('/admin/password');
}

router.get('/admin/password', (req, res) => {
    if(req.session.authenticated) return res.redirect('/admin/home');
    res.send(buildPasswordPage());
})

router.get('/admin/:page', requireAuth, (req, res) => {
    res.send(buildAdminPage(req.params.page));
})

router.get('/admin/products/:id', requireAuth, (req, res) => {
    res.send(buildAdminPage('product'));
})

module.exports = router;
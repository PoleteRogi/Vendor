const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const session = require('express-session');

require('dotenv').config();

const homeRoute = require('./routes');
const productRoute = require('./routes/product');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const bodyParser = require('body-parser');

const {
    createOrder,
    completeOrder
} = require('./db/orders');

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

app.post(
    '/api/stripe/webhook',
    bodyParser.raw({
        type: 'application/json'
    }),
    (req, res) => {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const sig = req.headers['stripe-signature'];

        console.log('webhook')

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('Webhook signature verification failed.', err.message);
            return res.status(400).send(`Webhook Error`);
        }

        // Handle the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const orderId = session.metadata.orderId;

            console.log(session)

            // THIS is where payment is confirmed
            completeOrder(orderId, {
                address: session.shipping.address,
                name: escapeHTML(session.customer_details.name),
                phone: escapeHTML(session.customer_details.phone),
                email: escapeHTML(session.customer_details.email)
            });
        }

        res.json({
            received: true
        });
    }
);

app.use(cookieParser());

app.use(session({
    name: 'session',
    secret: 'vendor-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 30
    }
}));

const analytics = require('./db/analytics');
app.use(analytics.router);

// body parsers
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// static files AFTER analytics
app.use(express.static('public'));

// routes
app.use('/', homeRoute);
app.use('/', productRoute);
app.use('/', apiRoutes);
app.use('/', adminRoutes);

module.exports = app;
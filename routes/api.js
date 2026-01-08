const express = require('express');
const router = express.Router();

const {
    getProductById,
    getAllProducts,
    addProduct,
    changeProduct,
    deleteProduct,
    getAvailableProducts
} = require('../db/products');
const {
    getProductImages,
    addImagesToProduct
} = require('../db/images');

const {
    createOrder,
    completeOrder,
    getOrder,
    getAllOrders,
} = require('../db/orders');

router.get('/api/product/:id', (req, res) => {
    const product = getProductById(req.params.id);

    if (!product) {
        return res.status(404).send('Product not found');
    }

    res.send(JSON.stringify(product));
});

router.get('/api/products', (req, res) => {
    const products = getAllProducts();

    if (req.session.authenticated) return res.send(JSON.stringify(products));
    else {
        // filter and only send available products
        const availableProducts = products.filter(p => p.available);

        return res.send(JSON.stringify(availableProducts));
    }
});

router.get('/api/related-products/:id', (req, res) => {
    const product = getProductById(req.params.id);

    if (!product) {
        return res.status(404).send('Product not found');
    }

    res.send(JSON.stringify(getAvailableProducts().filter(p => p.category === product.category && p.id !== product.id)));
})

router.get('/api/image/:id', (req, res) => {
    res.send(JSON.stringify(getProductImages(req.params.id)));
})

const analytics = require('../db/analytics');

router.get('/api/analytics', (req, res) => {
    if (!req.session.authenticated) return res.status(401).send('Unauthorized');

    res.send(JSON.stringify({
        sessions: analytics.db.get().length,
        totalSales: getAllOrders().filter(o => o.status === 'completed').reduce((acc, order) => acc + order.total, 0),
        // get only completed orders
        orders: getAllOrders().filter(o => o.status === 'completed').length,
        conversionRate: getAllOrders().reduce((acc, order) => acc + (order.status === 'completed' ? 1 : 0), 0) / analytics.db.get().length * 100
    }));
})

router.post('/api/add-product', (req, res) => {
    if (!req.session.authenticated) return res.status(401).send('Unauthorized');

    // random id
    const uuid = Math.random().toString(36).slice(2);
    const product = addProduct(uuid, 'Untitled Product', '', '', 0, 'placeholder.webp');

    res.send(JSON.stringify(product));
})

router.post('/api/edit-product/:id', (req, res) => {
    if (!req.session.authenticated) return res.status(401).send('Unauthorized');

    if (!getProductById(req.params.id)) {
        return res.status(404).send('Product not found');
    }

    changeProduct(req.params.id, req.body);

    res.send('Product updated');
})

const upload = require("../services/upload");

router.post(
    "/api/upload-image/:id",
    upload.single("image"),
    (req, res) => {

        if (!req.session.authenticated) {
            return res.status(401).send("Unauthorized");
        }

        if (!getProductById(req.params.id)) {
            return res.status(404).send("Product not found");
        }

        if (!req.file) {
            return res.status(400).send("No image uploaded");
        }

        const currentImages = getProductImages(req.params.id);
        currentImages[req.body.index] = req.file.filename;
        console.log(currentImages);

        addImagesToProduct(req.params.id, currentImages);

        res.send({
            success: true,
            filename: req.file.filename
        });
    }
);

router.delete('/api/delete-product/:id', (req, res) => {
    if (!req.session.authenticated) return res.status(401).send('Unauthorized');

    if (!getProductById(req.params.id)) {
        return res.status(404).send('Product not found');
    }

    deleteProduct(req.params.id);

    res.send('Product deleted');
})

// STRIPE

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/api/checkout', (req, res) => {
    const {
        cart,
        currency
    } = req.body;

    const products = [];
    const productsObjects = []

    for (let i = 0; i < cart.length; i++) {
        const product = getProductById(cart[i]);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        products.push({
            price_data: {
                currency: 'usd',
                unit_amount: product.price * 100,
                product_data: {
                    name: product.name,
                }
            },
            quantity: 1,
        });

        productsObjects.push({
            id: product.id,
            name: product.name,
            price: product.price,
            images: getProductImages(product.id)
        })
    }

    /*

    const TAX_PERCENTAGE = 21;

    products.push({
        price_data: {
            currency: 'usd',
            unit_amount: productsObjects.reduce((acc, product) => acc + product.price, 0) * TAX_PERCENTAGE / 100 * 100,
            product_data: {
                name: 'Tax',
            }
        },
        quantity: 1,
    })

    */

    products.push({
        price_data: {
            currency: 'usd',
            unit_amount: 5 * 100 /* 5$ */,
            product_data: {
                name: 'Shipping',
                images: [
                    'https://images.unsplash.com/photo-1552664730-1742b8d6fb63?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
                ]
            }
        },
        quantity: 1,
    })

    const order = createOrder(productsObjects);

    stripe.checkout.sessions.create({
        line_items: products,
        mode: 'payment',
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        shipping_address_collection: {
            allowed_countries: ["ES"]
        },
        metadata: {
            orderId: order.id
        },
        success_url: 'http://localhost:3000/order/' + order.id,
        cancel_url: 'http://localhost:3000/'
    }).then(session => {
        res.send({
            url: session.url
        });
    });
});

router.get('/api/order/:id', (req, res) => {
    const order = getOrder(req.params.id);

    if (!order) {
        return res.status(404).send('Order not found');
    }

    res.send(JSON.stringify(order));
})

router.get('/api/orders', (req, res) => {
    if(!req.session.authenticated) return res.status(401).send('Unauthorized');

    const orders = getAllOrders();

    // order from newest to oldest
    orders.sort((a, b) => b.createdAt - a.createdAt);

    res.send(JSON.stringify(orders));
})

const SETTINGS = require('../services/settings');

router.get('/api/settings', (req, res) => {
    if(!req.session.authenticated) return res.status(401).send('Unauthorized');

    res.send(JSON.stringify(SETTINGS.getAll()));
})

router.post('/api/settings', (req, res) => {
    if(!req.session.authenticated) return res.status(401).send('Unauthorized');

    const new_Settings = req.body;

    for (const key in new_Settings) {
        const keyTypeOf = typeof new_Settings[key];

        let newValue;
        switch (keyTypeOf) {
            case 'string':
                newValue = '"' + new_Settings[key] + '"';
                break;
            default:
                newValue = new_Settings[key];
                break;
        }

        SETTINGS.set(key, newValue);
    }

    res.send('Settings updated');
})

module.exports = router;
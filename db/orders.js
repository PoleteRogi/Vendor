const dawgdb = require('dawg-db');

const ordersDB = new dawgdb.Database('orders');

function createOrder(cart)
{
    const orderId = Math.random().toString(36).slice(2);

    const order = ordersDB.add({
        id: orderId,
        cart: cart,
        status: 'pending',
        createdAt: Date.now(),
        paidAt: null,
        total: cart.reduce((total, item) => total + parseInt(item.price), 0),
        userData: null
    });

    return order;
}

function completeOrder(orderId, userData) {
    const order = ordersDB.query({
        id: orderId
    });

    ordersDB.remove(order);
    
    order.paidAt = Date.now();
    order.status = 'completed';
    order.userData = userData;

    ordersDB.add(order);

    ordersDB.update();

    return order;
}

function getOrder(orderId)
{
    return ordersDB.query({
        id: orderId
    });
}

function getAllOrders() {
    return ordersDB.get();
}

function cancelOrder(orderId) {
    const order = ordersDB.query({
        id: orderId
    });

    ordersDB.remove(order);
    
    order.status = 'cancelled';

    ordersDB.add(order);

    ordersDB.update();

    return order;
}

module.exports = {
    createOrder,
    completeOrder,
    getOrder,
    getAllOrders,
    cancelOrder
}
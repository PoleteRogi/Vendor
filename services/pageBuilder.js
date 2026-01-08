const fs = require('fs');
const path = require('path');

const { getProductImages } = require('../db/images');

const { minify } = require('html-minifier');

function minifyHTML(html) {
    return minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: false,
    });
}

function loadTemplate(name) {
    return minifyHTML(fs.readFileSync(
        path.join(__dirname, '..', 'templates', name),
        'utf8'
    ));
}

const SETTINGS = require('./settings');

function buildPage(content)
{
    return loadTemplate('global.html')
        .replaceAll('${content}', content).replaceAll('\n', '')
        .replaceAll('${page_name}', SETTINGS.get('PAGE_NAME'));
}

function buildProductPage(product) {
    return buildPage(loadTemplate('productPage.html')
        .replaceAll('${id}', product.id)
        .replaceAll('${name}', product.name)
        .replaceAll('${subtitle}', product.subtitle)
        .replaceAll('${description}', product.description.replaceAll('\n', '<br>'))
        .replaceAll('${price}', product.price))
        .replaceAll('${category}', product.category)
        .replaceAll('${available}', product.available)
        .replaceAll('${images}', JSON.stringify(getProductImages(product.id)));
}

function buildHomePage(products) {
    const home = loadTemplate('home.html');
    const productTemplate = loadTemplate('product.html');

    // order products by date
    products = products.sort((a, b) => b.addedAt - a.addedAt);

    const productsHTML = products.map(p =>

        productTemplate
        .replaceAll('${id}', p.id)
        .replaceAll('${name}', p.name)
        .replaceAll('${subtitle}', p.subtitle)
        .replaceAll('${description}', p.description)
        .replaceAll('${price}', p.price)
        .replaceAll('${image}', JSON.stringify(getProductImages(p.id)[0]))
        .replaceAll('${secondary_image}', JSON.stringify(getProductImages(p.id)[1] || getProductImages(p.id)[0]))
    ).join('');


    return buildPage(home.replaceAll('${products}', productsHTML));
}

function buildPasswordPage() {
    return buildPage(loadTemplate('password.html'));
}

function build404Page() {
    return buildPage(loadTemplate('404.html'));
}

function buildAdminPage(page)
{
    try {
        const pageHTML = loadTemplate('admin/' + page + '.html');
        return loadTemplate('admin.html').replaceAll('${content}', pageHTML);
    }
    catch {
        return buildPage(loadTemplate('404.html'));
    }
}

const { getOrder } = require('../db/orders');

function buildOrderSuccessPage(id)
{
    const order = getOrder(id);

    return buildPage(loadTemplate('orderSuccess.html')
        .replaceAll('${id}', id)
        .replaceAll('${total}', order.total)
        .replaceAll('${name}', order.userData.name)
        .replaceAll('${postalCode}', order.userData.address.postal_code)
        .replaceAll('${email}', order.userData.email)
    );
}

module.exports = {
    buildProductPage,
    buildHomePage,
    build404Page,
    buildPasswordPage,
    buildAdminPage,
    buildOrderSuccessPage
};
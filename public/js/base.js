let columnsOffset = 0;

function updateProductColumns() {
    const productList = document.querySelector('.product-list:not(.horizontal-list)');
    if (!productList) return;

    const containerWidth = productList.clientWidth;
    const minItemWidth = 220;
    const gap = 60;

    const columns = Math.max(
        1,
        Math.floor((containerWidth + gap) / (minItemWidth + gap)) + columnsOffset
    );

    productList.style.setProperty('--col-count', columns);
}

function onLoad() {
    setTimeout(() => {
        document.body.style.opacity = 1;
    }, 1);

    const priceLabel = document.querySelectorAll('#price-label');

    priceLabel.forEach(label => {
        if(!available) {
            label.innerHTML = 'Unavailable';
            return;
        }
        label.innerHTML = convertUsd(price, CURRENCY_CODE).toLocaleString('en-US', {
            style: 'currency',
            currency: CURRENCY_CODE
        });
    });

    const currencySelect = document.querySelector('#currencySelect');

    if (currencySelect) {
        for (const currencyCode in CURRENCY_RATES) {
            const option = document.createElement('option');
            option.value = currencyCode;
            option.textContent = `${CURRENCY_RATES[currencyCode].symbol} ${currencyCode}`;
            currencySelect.appendChild(option);
        }

        currencySelect.value = CURRENCY_CODE;

        currencySelect.addEventListener('change', () => {
            setCurrency(currencySelect.value);
        });
    }

    // PRODUCTLIST RESIZING

    const productList = document.querySelector('.product-list');

    // Initial run
    updateProductColumns();

    // Observe size changes
    const resizeObserver = new ResizeObserver(() => {
        updateProductColumns();
    });

    if (productList) resizeObserver.observe(productList);

    document.querySelector('main').onclick = () => {
        if (!document.querySelector('.cart')) return;
        document.querySelector('.cart').classList.remove('open');
    }

    if (document.querySelector('.cart')) loadCart();

    // get params in url
    const urlParams = new URLSearchParams(window.location.search);
    const sayMessage = urlParams.get('say');

    if (sayMessage) say(sayMessage);

    // remove params from url
    history.replaceState(null, null, window.location.pathname);

    updateCheckboxes();
}

function updateCheckboxes() {
    const checkboxes = document.querySelectorAll('.checkbox');

    checkboxes.forEach(checkbox => {
        const value = checkbox.getAttribute('value');

        const checkboxImg = checkbox.querySelector('img');

        if (value == 'true') {
            checkboxImg.src = '/assets/ui/check.svg';
            checkbox.classList.remove('false');
            checkbox.classList.add('true');
        } else {
            checkboxImg.src = '/assets/ui/close.svg';
            checkbox.classList.remove('true');
            checkbox.classList.add('false');
        }
        checkbox.onclick = function () {
            if (checkbox.getAttribute('value') == 'true') {
                checkbox.setAttribute('value', 'false');
            } else {
                checkbox.setAttribute('value', 'true');
            }

            updateCheckboxes();
        }
    });
}

var CURRENT_CART = []

function loadCart() {
    CURRENT_CART = JSON.parse(localStorage.getItem('cart')) || [];

    document.querySelector('.cart-checkout-button').disabled = CURRENT_CART.length == 0;

    localStorage.setItem('cart', JSON.stringify(CURRENT_CART));

    const cartNumber = document.querySelector('.cart-number');
    cartNumber.textContent = CURRENT_CART.length;

    document.querySelector('.cart-product-list').innerHTML = '';

    if (CURRENT_CART.length == 0) document.querySelector('.cart-product-list').innerHTML = 'Your cart is empty';

    let cartTotalValue = 0;

    for (let i = 0; i < CURRENT_CART.length; i++) {
        fetch(`/api/product/${CURRENT_CART[i]}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status == 404) {
                        CURRENT_CART.splice(i, 1);
                        localStorage.setItem('cart', JSON.stringify(CURRENT_CART));
                        loadCart();
                    }
                }

                return response.json();
            })
            .then(product => {
                if(product.available == false) 
                {
                    CURRENT_CART.splice(i, 1);
                    localStorage.setItem('cart', JSON.stringify(CURRENT_CART));
                    loadCart();
                    return;
                }
                cartTotalValue += parseInt(product.price);

                const cartTotal = document.querySelector('#cart-total-price');
                cartTotal.textContent = convertUsd(cartTotalValue, CURRENCY_CODE).toLocaleString('en-US', {
                    style: 'currency',
                    currency: CURRENCY_CODE
                });

                const cartProduct = document.createElement('div');
                cartProduct.classList.add('cart-product');

                const cartProductImage = document.createElement('img');
                cartProduct.appendChild(cartProductImage);

                fetch(`/api/image/${CURRENT_CART[i]}`)
                    .then(response => response.json())
                    .then(images => {
                        cartProductImage.src = "/assets/uploads/" + images[0];
                    })

                const cartProductBoxLeft = document.createElement('div');
                cartProductBoxLeft.classList.add('cart-product-box-left');
                cartProductBoxLeft.innerHTML = `<a href="/${product.id}">` + product.name + `</a>`;
                cartProduct.appendChild(cartProductBoxLeft);

                const cartProductBoxRight = document.createElement('div');
                cartProductBoxRight.classList.add('cart-product-box-right');
                cartProductBoxRight.innerHTML = `<span>${convertUsd(product.price, CURRENCY_CODE).toLocaleString('en-US', {
            style: 'currency',
            currency: CURRENCY_CODE
        })}</span>`;
                cartProduct.appendChild(cartProductBoxRight);

                const cartRemoveButton = document.createElement('a');
                cartRemoveButton.classList.add('cart-remove-button');
                cartRemoveButton.href = '#';
                cartRemoveButton.innerHTML = `<img src="/assets/ui/close.svg" alt="">`;
                cartRemoveButton.addEventListener('click', () => {
                    CURRENT_CART.splice(i, 1);
                    localStorage.setItem('cart', JSON.stringify(CURRENT_CART));
                    loadCart();
                });
                cartProduct.appendChild(cartRemoveButton);

                document.querySelector('.cart-product-list').appendChild(cartProduct);
            })
    }
}

function addToCart(id) {
    CURRENT_CART.push(id);
    localStorage.setItem('cart', JSON.stringify(CURRENT_CART));
    loadCart();
    setTimeout(() => document.querySelector('.cart').classList.add('open'), 100);
}

function clearCart() {
    CURRENT_CART = [];
    localStorage.setItem('cart', JSON.stringify(CURRENT_CART));
    loadCart();
}

function toggleCartUI() {
    document.querySelector('.cart').classList.toggle('open');
}

function toggleColumnViews() {
    columnsOffset = columnsOffset == 0 ? 1 : 0;
    updateProductColumns();
}

function say(message) {
    const popupMessage = document.createElement('div')
    popupMessage.classList.add('popup-message')
    popupMessage.textContent = message
    document.body.appendChild(popupMessage)

    setTimeout(() => {
        popupMessage.classList.add('active')

        setTimeout(() => {
            popupMessage.classList.remove('active')

            setTimeout(() => {
                document.body.removeChild(popupMessage)
            }, 500)
        }, 3000)
    }, 50)
}

function checkout()
{
    fetch('/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({cart: CURRENT_CART, currency: CURRENCY_CODE})
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = data.url;
    })
}

function buyNow(id)
{
    const lastCart = [...CURRENT_CART];
    CURRENT_CART = [id];
    checkout();
    CURRENT_CART = lastCart;
}

document.addEventListener('DOMContentLoaded', onLoad);

function startSessionHeartbeat() {
    // Send immediately on page load
    navigator.sendBeacon('/_ping-session');

    // Then every 15 seconds
    setInterval(() => {
        navigator.sendBeacon('/_ping-session');
    }, 2000);

    // Also send on tab close / reload
    window.addEventListener('beforeunload', () => {
        navigator.sendBeacon('/_end-session');
    });
}

// Start the heartbeat when the page loads
document.addEventListener('DOMContentLoaded', startSessionHeartbeat);
// Primary currencies and approximate conversion rates from 1 USD
const CURRENCY_RATES = {
    USD: {
        symbol: "$",
        rate: 1.0
    }, // US Dollar
    EUR: {
        symbol: "€",
        rate: 0.85
    }, // Euro
    GBP: {
        symbol: "£",
        rate: 0.74
    }, // British Pound
    JPY: {
        symbol: "¥",
        rate: 156
    }, // Japanese Yen
    AUD: {
        symbol: "A$",
        rate: 1.37
    }, // Australian Dollar
    CAD: {
        symbol: "C$",
        rate: 1.37
    }, // Canadian Dollar
    CHF: {
        symbol: "CHF",
        rate: 0.79
    }, // Swiss Franc
    CNY: {
        symbol: "¥",
        rate: 7.04
    } // Chinese Yuan
};

var CURRENCY_CODE = 'USD';

if (localStorage.getItem('currency')) {
    CURRENCY_CODE = localStorage.getItem('currency');
}

function setCurrency(currencyCode) {
    CURRENCY_CODE = currencyCode;
    localStorage.setItem('currency', currencyCode);
    location.reload();
}

function convertUsd(amountUSD, currencyCode) {
    const currency = CURRENCY_RATES[currencyCode];
    if (!currency) throw new Error(`Currency "${currencyCode}" not supported`);
    return amountUSD * currency.rate;
}
const dawgdb = require('dawg-db');

const productsDB = new dawgdb.Database('products');

const images = require('./images');

/*productsDB.add({
    id: "wet-towel",
    name: "WET TOWEL",
    subtitle: "100ml EAU DE PARFUM",
    description: "<i>Warm skin, salt air, fabric drying too slowly</i><br> <br> top notes: <br> mandarin, marine notes<br> <br> heart notes:<br> iris, coconut, jasmine<br> <br> base notes:<br> musk, ambroxan, sand, cedar<br> <br> Ingredients: Alcohol Denat., Parfum, Limonene, Linalool, Citral, Benzyl Alcohol, Benzyl Benzoate, Benzyl Salicylate, Farnesol, Alpha-Isomethyl Ionone, Methyl Dihydrojasmonate.",
    price: 70,
})*/

function addProduct(id, name, subtitle, description, price, mainImage) {
    const item = productsDB.add({
        id: id,
        name: name,
        subtitle: subtitle,
        description: description,
        price: price,
        available: true,
        addedAt: Date.now(),
        category: 'all'
    });

    images.addImagesToProduct(id, [mainImage])

    return item
}

function deleteProduct(id)
{
    productsDB.remove(getProductById(id));
}

/*createProduct(
    "wet-towel",
    "WET TOWEL",
    "100ml EAU DE PARFUM",
`<i>Warm skin, salt air, fabric drying too slowly</i>
    
top notes: 
mandarin, marine notes

heart notes:
iris, coconut, jasmine

base notes:
musk, ambroxan, sand, cedar

Ingredients: Alcohol Denat., Parfum, Limonene, Linalool, Citral, Benzyl Alcohol, Benzyl Benzoate, Benzyl Salicylate, Farnesol, Alpha-Isomethyl Ionone, Methyl Dihydrojasmonate.
`,
    70,
    "wet_towel_bottle.png"
)

createProduct(
    "pink-white",
    "PINK & WHITE",
    "100ml EAU DE PARFUM",
`<i>Overexposed sweetness remembered without flavor</i>
    
top notes:
bergamot, aldehydes, sea air

heart notes:
rose oxide, orris, lactonic notes

base notes:
clean musk, dry amber, iso e super

Ingredients: Alcohol Denat., Parfum, Limonene, Linalool, Citral, Geraniol, Alpha-Isomethyl Ionone, Benzyl Alcohol.`,
    70,
    "pink_&_white_bottle.png"
)

createProduct(
    "highschool-crush",
    "HIGHSCHOOL CRUSH",
    "100ml EAU DE PARFUM",
`<i>Sweetness remembered with embarrassment</i>
    
top notes:
dust accord, faint metallic note, dry aldehydes

heart:
china rose, lactonic, heliotrope

base:
soft/dry vanilla, musk, benzoin

Ingredients: Alcohol Denat., Parfum, Linalool, Limonene, Citral, Benzyl Alcohol, Benzyl Benzoate, Alpha-Isomethyl Ionone, Hydroxycitronellal, Benzyl Salicylate, Coumarin, Geraniol, Cinnamyl Alcohol`,
    70,
    "highschool_crush_bottle.png"
)

createProduct(
    "the-sleepover",
    "THE SLEEPOVER",
    "100ml EAU DE PARFUM",
`<i>Shared warmth, suspended time</i>
    
top notes:
ozonic notes, linen, lavender

heart:
soft wood, chamomile

base:
musk, iso e super, tonka beans

Ingredients: Alcohol Denat., Parfum, Linalool, Limonene, Linalyl Alcohol, Citral, Coumarin, Alpha-Isomethyl Ionone, Benzyl Benzoate, Benzyl Salicylate, Geraniol`,
    70,
    "the_sleepover_bottle.png"
)*/

function getAllProducts() {
    return productsDB.get();
}

function getAvailableProducts() {
    return productsDB.query({
        available: true
    });
}

function getProductById(id) {
    const result = productsDB.query({
        id: id
    });
    return Array.isArray(result) ? result[0] : result;
}

function changeProduct(id, data)
{
    productsDB.remove(getProductById(id));
    productsDB.add(data);
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    changeProduct,
    deleteProduct,
    getAvailableProducts
};
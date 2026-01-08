const dawgdb = require('dawg-db');

const imagesDB = new dawgdb.Database('images');

function addImagesToProduct(id, images) {
    const alreadyExistingProduct = imagesDB.query({
        id: id
    })

    if(alreadyExistingProduct) {
        imagesDB.remove(alreadyExistingProduct);
    }

    imagesDB.add({
        id: id,
        images: images
    });
}

function getProductImages(id)
{
    const result = imagesDB.query({
        id: id
    });
    
    const images = result.images;

    return images;
}

module.exports = {
    addImagesToProduct,
    getProductImages
}
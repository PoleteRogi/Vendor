const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/assets/uploads");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        
        // random uid
        const id = Math.random().toString(36).slice(2);

        // productId-index.ext  →  wet-towel-0.jpg
        cb(null, `${req.params.id}-${id}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Not an image"));
        }
        cb(null, true);
    }
});

module.exports = upload;

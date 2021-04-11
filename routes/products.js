const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController')
const multer = require('multer')


let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

router.use(multer({storage:storage, fileFilter:fileFilter}).single("yourImage"))
// router.get('/', productController.index)
router.get('/', productController.findAll)
router.get('/image/:imageName', productController.getImage)
router.post('/', productController.create)
router.get('/:id', productController.getProduct)
router.put('/:id', productController.update)
router.delete('/:id', productController.delete)

module.exports = router
const express = require('express');
const firmController = require('../controllers/firmController');
const verifyToken = require('../middlewares/verifyToken');
const path = require('path');

const router = express.Router();

// Use the controller's method that includes multer middleware
router.post('/add-firm', verifyToken, firmController.addFirm);

router.get('/uploads/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    res.set('Content-Type', 'image/jpeg');
    res.sendFile(path.join(__dirname, '../uploads', imageName));
});

router.delete('/:firmId', firmController.deleteFirmById);

module.exports = router;
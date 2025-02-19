const Firm = require("../models/Firm");
const Vendor = require('../models/Vendor');
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Ensure uploads directory exists
        const dir = 'uploads/';
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

const addFirm = async(req, res) => {
    try {
        console.log('Request body:', req.body); // Debug log
        console.log('Request file:', req.file); // Debug log
        console.log('Vendor ID:', req.vendorId); // Debug log

        // Validate required fields
        const { firmName, area } = req.body;
        if (!firmName || !area) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['firmName', 'area'],
                received: req.body 
            });
        }

        // Convert category and region to arrays if they're strings
        const category = Array.isArray(req.body.category) ? req.body.category : 
                        req.body.category ? [req.body.category] : [];
        const region = Array.isArray(req.body.region) ? req.body.region : 
                      req.body.region ? [req.body.region] : [];
        const offer = req.body.offer || '';
        const image = req.file ? req.file.filename : undefined;

        // Validate vendor ID
        if (!req.vendorId) {
            return res.status(401).json({ message: "Vendor ID not found in request" });
        }

        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Create new firm
        const firm = new Firm({
            firmName,
            area,
            category,
            region,
            offer,
            image,
            vendor: vendor._id // Changed to single ID instead of array
        });

        console.log('Firm to save:', firm); // Debug log

        const savedFirm = await firm.save();
        
        // Update vendor's firms array
        if (!vendor.firm) {
            vendor.firm = [];
        }
        vendor.firm.push(savedFirm._id);
        await vendor.save();

        return res.status(201).json({ 
            message: 'Firm Added Successfully',
            firm: savedFirm
        });
    } catch (error) {
        console.error('Error in addFirm:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'A firm with this name already exists',
                error: error.message
            });
        }
        return res.status(500).json({ 
            message: 'Error in adding firm',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const deleteFirmById = async(req, res) => {
    try {
        const firmId = req.params.firmId;
        const deletedProduct = await Firm.findByIdAndDelete(firmId);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Firm not found" });
        }
        res.status(200).json({ message: "Firm deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error ", error: error.message });
    }
};

module.exports = {
    addFirm: [upload.single('image'), addFirm],
    deleteFirmById
};
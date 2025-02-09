const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv');

dotEnv.config();

const secretKey = process.env.WhatISYourName; // Define the secret key

const verifyToken = async (req, res, next) => {
    // Check for token in both Authorization header and custom token header
    const token = req.headers.authorization 
        ? req.headers.authorization.split(' ')[1] 
        : req.headers.token;

    if (!token) {
        return res.status(401).send({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, secretKey); // Use the defined secret key
        console.log('Decoded token payload:', decoded); // Log the entire decoded payload
        const vendor = await Vendor.findById(decoded.vendorId);
    
        if (!vendor) {
            return res.status(404).send({ message: 'Vendor not found' });
        }
        req.vendorId = vendor._id;
        next();
    } catch (error) {
        console.error('Token verification error:', error); // Log the error for debugging
        return res.status(400).send({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;
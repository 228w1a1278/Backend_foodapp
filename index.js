const express=require("express");
const dotEnv=require("dotenv");
const mongoose = require("mongoose");
const vendorRoutes=require('./routes/vendorRoutes')
const bodyParser=require('body-parser');
const firmRoutes=require('./routes/firmRoutes')
const productRoutes=require('./routes/productRoutes')
const cors=require('cors')
const path=require('path')
const multer=require('multer')

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

// Create multer instance with configuration
const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('image'); // 'image' should match the field name in your form

const app = express()

const PORT=process.env.PORT ||4001

dotEnv.config()
app.use(cors())

mongoose.connect(process.env.MONGO_URI)
   .then(()=> console.log("DB connected"))
   .catch((error)=> console.log(error))

app.use(bodyParser.json())   
app.use('/vendor',vendorRoutes);
app.use('/firm',firmRoutes);
app.use('/product',productRoutes);
app.use('/uploads',express.static('uploads'));

// Make upload middleware available globally
app.use((req, res, next) => {
    req.upload = upload;
    next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof require('multer').MulterError) {
        // Handle Multer-specific errors
        return res.status(400).json({
            error: true,
            message: `Upload error: ${err.message}`,
            field: err.field
        });
    } else if (err) {
        // Handle other errors
        return res.status(500).json({
            error: true,
            message: err.message
        });
    }
    next();
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
});

app.use('/home',(req,res)=>{
    res.send('Welcome to home page')
})


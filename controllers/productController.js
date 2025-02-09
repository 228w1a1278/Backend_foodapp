const Firm = require("../models/Firm");
const Product= require("../models/Product");
const multer=require("multer");
const { deleteFirmById } = require("./firmController");


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      // Files will be saved in the "uploads" directory
      cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
      // Create a unique file name with the original extension
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
const upload = multer({ storage: storage });

const addProduct=async(req,res) =>{
    try{
        const{productName,price,category,bestseller,description}=req.body;
        const image=req.file?req.file.filename :undefined;


        const firmId=req.params.firmId
        const firm=await Firm.findById(firmId);

        if(!firm){
            return res.status(404).json({message:"Firm not found"})
        }
        const product=new Product({
            productName,price,category,bestseller,description,image,firm:firm._id
    })


    const savedProduct=await product.save();

    firm.Products.push(savedProduct);

    await firm.save();  

    res.status(200).json(savedProduct)

}catch(error){
    console.log(error)
    res.status(500).json({message:"Error in adding product"})
}
}

const getProductByFirm=async(req,res)=>{
     try {
        const firmId=req.params.firmId
        const firm=await Firm.findById(firmId);
        if(!firm){
            return res.status(404).json({message:"Firm not found"})
            }
        
        const restaurantName=firm.firmName;    
         const products=await Product.find({firm:firmId});
         res.status(200).json({restaurantName,products})
     } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal Server Error "})
     }
}

const deleteProductById=async(req,res)=>{
    try {
        const productId=req.params.productId
        const deletedProduct=await Product.findByIdAndDelete(productId);
        if(!deletedProduct){
            return res.status(404).json({message:"Product not found"})
            }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal Server Error "})
    }
}



module.exports={addProduct: [upload.single('image'),addProduct],getProductByFirm,deleteProductById};

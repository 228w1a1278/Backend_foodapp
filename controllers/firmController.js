const Firm=require('../models/Firm')
const Vendor=require('../models/Vendor')
const multer=require('multer')

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


const addFirm =async(req,res) =>{
    try{
   const {firmName,area,category,region,offer} =req.body;

   const image=req.file?req.file.filename :undefined;
   
   const vendor= await Vendor.findById(req.vendorId);
   if(!vendor){
    return res.status(404).json({message:"Vendor not found"})
   }
   const firm = new Firm({
    firmName,area,category,region,offer,image,vendor:vendor._id
    });

    const savedFirm=await firm.save();
    vendor.firm.push(savedFirm)
    await vendor.save();

    return res.status(200).json({message:'Firm Added Successfully'});
    }catch(error){
      console.error(error)
      return res.status(500).json({message:'Error in adding firm'})
    }
}

const deleteFirmById=async(req,res)=>{
  try {
      const firmId=req.params.firmId
      const deletedProduct=await Firm.findByIdAndDelete(firmId);
      if(!deletedProduct){
          return res.status(404).json({message:"Firm not found"})
          }
  } catch (error) {
      console.error(error);
      res.status(500).json({message:"Internal Server Error "})
  }
}

module.exports={addFirm: [upload.single('image'),addFirm],deleteFirmById}
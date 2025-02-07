const Product = require("../../models/productSchema")

const productList = async(req,res)=>{
    try {
        // const products= await Product.find({deleted:false})
        res.render("product")
    } catch (error) {
        console.error(error)
        res.status(500).json({success:false,message:"Internal server error"})
    }
}

module.exports={
    productList
}
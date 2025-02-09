const Product = require("../../models/productSchema")

const productList = async(req,res)=>{

    try {

        let search=""
        if(req.query.search){
            search=req.query.search
        }
        let page=1
        if(req.query.page){
            page=req.query.page
        }
        const limit=3
        const data = await Product.find({
           
        })
        .limit(limit*1)
        .skip((page-1)*limit)
        .exec()
console.log("hi",data)
        const count = await Product.find({

            isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}}
            ]
        }).countDocuments()
     const totalPages=Math.ceil(count/limit)
     const currentPage=page
        res.render("product",{data,totalPages,currentPage})
        
    } catch (error) {
        
        console.log(error);
        res.status(500).send("Server error")
    }
}

const getAddProduct=async(req,res)=>{
    try {
        const err = req.session.errMsg
        req.session.errMsg=''
        return res.render("addProduct",{message:err})
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error")
    }
}

const AddProduct = async(req,res)=>{
    try {
        const {productName,description,category,regularPrice,salePrice,quantity}=req.body
        console.log(req.body)

        const findPro=await Product.findOne({productName})
        if(findPro){
            req.session.errMsg = "Product already exists"
            return res.redirect("/admin/addProduct")
        }

        const newProduct = new Product({
            productName,description,category,regularPrice,salePrice,quantity
        })

        console.log(newProduct);
        await newProduct.save()
        return res.redirect("/admin/products")
        
        
    } catch (error) {
        console.error("Error in inserting data",error)
        res.status(500).send("Internal server error")
    }
}

const getEditProduct = async(req,res)=>{
    try {
        
        const proId = req.params.id        
        const pro = await Product.findById(proId)

        if(!pro){
            return res.status(404).send("Product not found")
        }

        res.render('editProduct',{pro})

    } catch (error) {
        res.status(500).send("Internal server error")
    }
}

const editProduct = async(req,res)=>{
    try {
        const {productName,description,category,regularPrice,salePrice,quantity}=req.body
        const proId = req.params.id
        console.log(req.body);

        
        if(!productName||!description||!category||!regularPrice||!salePrice||!quantity){
            return res.status(400).send("Please fill all the inputs")
        } 

        await Product.findByIdAndUpdate(proId,{productName,description,category,regularPrice,salePrice,quantity})
        res.redirect('/admin/products')

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while updating the product.");
    }
}

const listOrUnlist = async(req,res)=>{
    try {

        const {proId,status} =req.body
        console.log(req.body);

        const isListed = status=="unlist"?false:true

        const product = await Product.findById(proId)
        if(!product){
            return res.status(404).json({success:false,message:"Product not found"})
        }

        await Product.updateOne({_id:proId},{$set:{isListed:isListed}})

        res.status(200).json({success:true,message:"Status updated"})
        
    } catch (error) {
        
        console.error(error)
        res.status(500).json({success:false,message:"Internal server error"})
    }
}


module.exports={
    productList,
    getAddProduct,
    AddProduct,
    listOrUnlist,
    getEditProduct,
    editProduct
}
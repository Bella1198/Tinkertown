const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema")
const path = require("path")
const fs = require('fs');

const productList = async (req, res) => {

    try {

        let search = ""
        if (req.query.search) {
            search = req.query.search
        }
        let page = 1
        if (req.query.page) {
            page = req.query.page
        }
        const limit = 15
        const data = await Product.find({

        }).populate('category')
            // .limit(limit*1)
            // .skip((page-1)*limit)
            .exec()
        console.log("hi", data)
        const count = await Product.find({

            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*" } },
                { email: { $regex: ".*" + search + ".*" } }
            ]
        }).countDocuments()
        const totalPages = Math.ceil(count / limit)
        const currentPage = page
        res.render("product", { data, totalPages, currentPage })

    } catch (error) {

        console.log(error);
        res.status(500).send("Server error")
    }
}

const getAddProduct = async (req, res) => {
    try {

        const cat = await Category.find({ isListed: true })

        const err = req.session.errMsg
        req.session.errMsg = ''
        return res.render("addProduct", { message: err, cat })


    } catch (error) {
        console.log(error);
        res.status(500).send("Server error")
    }
}

const AddProduct = async (req, res) => {
    try {
        const { productName, description, category, regularPrice, salePrice, quantity } = req.body
        
        console.log("Files:", req.files);
        console.log("Category:", req.body.category);

        const findPro = await Product.findOne({ productName })
        if (findPro) {
            req.session.errMsg = "Product already exists"
            return res.redirect("/admin/addProduct")
        }
        

        const imagePath = [];
        req.files.forEach(element => {
            const filePath = "/uploads/"+element.filename
            imagePath.push(filePath)
        });
        const newProduct = new Product({
            productName, description, category, regularPrice, salePrice, quantity, productImage: imagePath
        })

        console.log(newProduct);
        await newProduct.save();
        return res.redirect("/admin/products")


    } catch (error) {
        console.error("Error in inserting data", error)
        res.status(500).send("Internal server error")
    }
}

const getEditProduct = async (req, res) => {
    try {

        const proId = req.params.id
        const pro = await Product.findById(proId) 
        const cat = await Category.find({isListed:true}) 

        if (!pro) {
            return res.status(404).send("Product not found")
        }

        res.render('editProduct', { pro,cat })


    } catch (error) {
        res.status(500).send("Internal server error")
        console.log(error);
        
    }
}

const editProduct = async (req, res) => {
    try {
        const proId = req.params.id
        let { productName, description, category, regularPrice, salePrice, quantity ,removedImages} = req.body      
        
        const proExist = await Product.findById(proId)
        if(!proExist){
            return res.status(404).send("Product not found")
        }

        console.log("proExist",proExist)
        console.log("removedImages",removedImages)

        if (removedImages) {
            if (typeof removedImages === "string") {
                removedImages = JSON.parse(removedImages); // Convert to array if it's a string
            }
        } else {
            removedImages = [];
        }

        if (removedImages.length>0) {
            let imagesToRemove = removedImages;
            proExist.productImage = proExist.productImage.filter(img => !imagesToRemove.includes(img));

            imagesToRemove.forEach(img => {
                let imagePath = path.join(__dirname, "../public/uploads/", img);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);  // Delete file from server
                }
            });
        }


        let imagePath = proExist.productImage;

        if(req.files){
            req.files.forEach(file=>imagePath.push(`/uploads/${file.filename}`))
            console.log("files", req.files)
        }

        await Product.findByIdAndUpdate(proId, { productName, description, category, regularPrice, salePrice, quantity, productImage: imagePath})
        res.redirect('/admin/products')

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while updating the product.");
    }
}

const listOrUnlist = async (req, res) => {
    try {

        const { proId, status } = req.body
        console.log(req.body);

        const isListed = status == "unlist" ? false : true

        const product = await Product.findById(proId)
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" })
        }

        await Product.updateOne({ _id: proId }, { $set: { isListed: isListed } })

        res.status(200).json({ success: true, message: "Status updated" })

    } catch (error) {

        console.error(error)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}




module.exports = {
    productList,
    getAddProduct,
    AddProduct,
    listOrUnlist,
    getEditProduct,
    editProduct,
}
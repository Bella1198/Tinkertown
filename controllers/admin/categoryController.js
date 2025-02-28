const Category = require("../../models/categorySchema")


const categoryList = async(req,res)=>{

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
        const data = await Category.find({
           
        })
        .exec()
console.log("hi",data)
        const count = await Category.find({

            isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}}
            ]
        }).countDocuments()
     const totalPages=Math.ceil(count/limit)
     const currentPage=page
        res.render("category",{data,totalPages,currentPage})
        
    } catch (error) {
        
        console.log(error);
        res.status(500).send("Server error")
    }
}

const getAddCategory=async(req,res)=>{
    try {

        const err = req.session.errMsg
        req.session.errMsg=''
        return res.render("addCategory",{message:err})
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error")
    }
}


const addCategory = async(req,res)=>{
    try {
        const {category,description}=req.body
        console.log(req.body)

        if(!category || !description){
            console.log("no data");
            return res.render("addCategory",{message:"Please fill all the fields"})            
        }

        const findCat=await Category.findOne({name:category})

        if(findCat){
            req.session.errMsg = "Category already exists"
            return res.redirect("/admin/addCategory")
        }

        const newCategory = new Category({
            name:category,description
        })

        await newCategory.save()
        return res.redirect("/admin/category")

        
    } catch (error) {
        console.error("Error in inserting data",error)
        res.status(500).send("Internal server error")
    }
}

const getEdit = async(req,res)=>{
    try {
        
        const catId = req.params.id        
        const cat = await Category.findById(catId)

        if(!cat){
            return res.status(404).send("Category not found")
        }

        res.render('editCategory',{cat})

    } catch (error) {
        res.status(500).send("Internal server error")
    }
}

const editCategory = async(req,res)=>{
    try {
        const {name,description}=req.body
        const catId = req.params.id
        console.log(req.body);

        
        if(!name||!description){
            return res.status(400).send("Name and description are required")
        } 

        await Category.findByIdAndUpdate(catId,{name,description})
        res.redirect('/admin/category')

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while updating the category.");
    }
}

const listOrUnlist = async(req,res)=>{
    try {

        const {catId,status} =req.body
        console.log(req.body);

        const isListed = status=="unlist"?false:true

        const category = await Category.findById(catId)
        if(!category){
            return res.status(404).json({success:false,message:"Category not found"})
        }

        await Category.updateOne({_id:catId},{$set:{isListed:isListed}})

        res.status(200).json({success:true,message:"Status updated"})
        
    } catch (error) {
        
        console.error(error)
        res.status(500).json({success:false,message:"Internal server error"})
    }
}


module.exports={
    categoryList,
    addCategory,
    listOrUnlist,
    getAddCategory,
    getEdit,
    editCategory
}
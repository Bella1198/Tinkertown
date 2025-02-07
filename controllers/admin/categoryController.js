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
        .limit(limit*1)
        .skip((page-1)*limit)
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

        res.render("addCategory")
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error")
    }
}


const addCategory = async(req,res)=>{
    try {
        const {name,description}=req.body
        console.log(req.body)

        const newCategory = new Category({
            name,description
        })

        await newCategory.save()
        res.redirect("/admin/categories")
        
    } catch (error) {
        console.error("Error in inserting data",error)
        res.status(500).send("Internal server error")
    }
}

const listOrUnlist = async(req,res)=>{
    try {

        const {name,isListed} =req.body
        console.log(req.body);

        const category = await Category.findById(name)
        if(!category){
            return res.status(404).json({success:false,message:"Category not found"})
        }

        await Category.updateOne({_id:name},{isListed})

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
    getAddCategory
}
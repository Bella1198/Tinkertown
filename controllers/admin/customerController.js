const User = require("../../models/userSchema")

const customerInfo = async(req,res)=>{

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
        const data = await User.find({
            isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}}
            ]
        })
        .limit(limit*1)
        .skip((page-1)*limit)
        .exec()

        const count = await User.find({

            isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*"}},
                {email:{$regex:".*"+search+".*"}}
            ]
        }).countDocuments()
     const totalPages=Math.ceil(count/limit)
     const currentPage=page
        res.render("customers",{data,totalPages,currentPage})
        
    } catch (error) {
        
        console.log(error);
        res.status(500).send("Server error")
    }
}

const customerBlocked = async(req,res)=>{
    try {

        let id=req.query.id
        await User.updateOne({_id:id},{$set:{isBlocked:true}})
        res.redirect("/admin/customers")
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error")    
    }
}

const customerUnblocked = async(req,res)=>{
    try {

        let id=req.query.id
        await User.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect("/admin/customers")
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error")
    }
}

module.exports={
    customerInfo,
    customerBlocked,
    customerUnblocked
}
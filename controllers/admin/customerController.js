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
        const limit=7
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

const toggleBlockCustomer = async(req,res)=>{
    try {
        const customerId = req.body.id;
        const customer = await User.findById(customerId);

        if (!customer) {
            return res.status(404).send("Customer not found");
        }

        // Toggle isBlocked field
        customer.isBlocked = !customer.isBlocked;
        await customer.save();

        res.redirect("/admin/users"); // Refresh the page
    } catch (error) {
        console.error("Error updating customer status:", error);
        res.status(500).send("Error updating customer status");
    }
}


module.exports={
    customerInfo,
    toggleBlockCustomer
}
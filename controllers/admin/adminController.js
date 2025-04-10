const User = require("../../models/userSchema")
const env = require("dotenv").config()
const bcrypt = require("bcrypt")


const loadLogin = async (req,res)=>{

    try {

        res.render("adminLogin",{message:""})
        
    } catch (error) {

        console.error("Error rendering login page",error)
        res.status(500).send("Internal server error")
    }
} 

const login = async(req,res)=>{

    try {

        const {email,password} = req.body

        const admin = await User.findOne({email})

        if (!admin) {
            return res.render("adminLogin", { message: "Invalid credentials" });
        }

            const isMatch = await bcrypt.compare(password,admin.password)


                if(!isMatch){
                    res.render("adminLogin",{message:"Invalid credentials"})
                }

                req.session.admin =admin._id;

                    res.redirect("/admin/dashboard")
            
        }
        
        catch (error) {
        
        console.log("Cannot Login",error);
        res.status(500).send("Server Error")
    }
}


const loadDashboard = async(req,res)=>{
     try{

        const data = await User.findOne()
        res.render('dashboard',{user:data})
        if(!data){
            return res.status(404).send("User not found")
        }
     }
     catch(error){
        console.log(error)
        res.status(500).send("Server error")
     }

}

const logout = async(req,res)=>{

    try {

        if (req.session) {

            req.session.admin = null; 
        }

        return res.redirect("/admin/adminLogin")
        
    } catch (error) {
        
        console.log("Unable to logout",error);
        res.status(500).send("Server Error")
    }
}

const pageError = async(req,res)=>{
    res.render("pageError")
}


module.exports = {
    loadLogin,
    login,
    loadDashboard,
    pageError,
    logout
}
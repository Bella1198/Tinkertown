const User = require("../../models/userSchema")
const env = require("dotenv").config()
const bcrypt = require("bcrypt")


const loadLogin = async (req,res)=>{

    try {

        res.render("adminLogin")
        
    } catch (error) {

        console.error("Error rendering login page",error)
        res.status(500).send("Internal server error")
    }
} 

const login = async(req,res)=>{

    try {

        const {email,password} = req.body
        console.log(req.body)
        const admin = await User.findOne({email})
        console.log(admin);

            const isMatch = await bcrypt.compare(password,admin.password)
            console.log(isMatch);
            
                if(isMatch){

                    console.log("Passwords match!")

                    req.session.admin =admin._id;

                    res.redirect("/admin/dashboard")

                }else{

                    res.status(401).send("Invalid credentials")
                    console.log("Passwords do not match");
                    
                }
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
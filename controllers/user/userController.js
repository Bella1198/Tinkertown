const User=require("../../models/userSchema")
const Product=require("../../models/productSchema")
const Category = require("../../models/categorySchema")
const env=require("dotenv").config()
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const { log } = require("console")
const req = require("express/lib/request")
const mongoose = require("mongoose")


const loadHomePage = async(req,res)=>{
    try {

        const userId = req.session.user;
        console.log(userId);
        const product = await Product.find({isListed:true}).populate("category")
        const final = product.filter(pro=> pro.category && pro.category.isListed)
        if(!userId){
         return res.render('home',{user:null,product:final})
        }
    const findUser = await User.findOne({_id:userId});
    console.log(findUser);
    
    res.render("home",{user:findUser,product:final})
     
        
    } catch (error) {

        console.log('Error in homePage',error);
        res.status(500).send("Server error")
    }
} 

const loadLogin = async(req,res)=>{
    res.render("login")
}

const login = async(req,res)=>{

    try {

        const {email,password} = req.body

        const user = await User.findOne({email})
        console.log(user);

        if (!email || !password) {
            return res.render("login",{mess:"Please fill all the fields"})
        }
        
        if(!user){
            return res.render("login",{message:"User doesn't exist"})
        }

        if(user){

            console.log("pass",password);
            console.log("user",user.password);

            const isMatch = await bcrypt.compare(password,user.password)
            console.log(password);
            

                if(isMatch){

                    console.log("Passwords match!")
                    req.session.userData = user;
                    req.session.user =user._id;

                    res.redirect("/")

                }else{

                    // res.render("login",{message:"User doesn't exist"})
                    res.status(401).send("Invalid credentials")
                    console.log("Passwords do not match");
                }
        }
        
    } catch (error) {
        
        console.log("Cannot Login",error);
        res.status(500).send("Server Error")
    }
}

const loadSignup = async(req,res)=>{

    try {

        const {user}= req.session

        if(user){
            return res.redirect('/')
        }
        const errormsg  = req.session.signupErrmsg;
        req.session.signupErrmsg = ''
        return res.render("signup", {message:errormsg})
        
    } catch (error) {
        
        console.log("Home page not loading:",error);
        res.status(500).redirect("/pageNotFound")

        
    }
}


const signup = async(req,res)=>{

   try {

    const {name,phone,email,password,confirmPassword}=req.body

    if(password!==confirmPassword){

        return res.render("signup",{message:"Passwords do not match"})
    }

    const findUser= await User.findOne({email})

    if(findUser){
        req.session.signupErrmsg="User with this email already exists"
        return res.redirect("/signup")
    }

    const otp = generateOtp()


    const emailSent = await sendVerificationEmail(email,otp)
    console.log(emailSent)

    if(!emailSent){
        console.log("Email sending failed!");
        return res.render("signup", { message: "Failed to send OTP. Try again later." });
    }

    req.session.userOtp=otp
    req.session.userData={name,phone,email,password}

    res.render("otp")
    console.log("OTP sent",otp );
    
   } catch (error) {

    console.error("signup error",error)
    res.redirect("/pageNotFound")
    
   }
}


function generateOtp(){
    return Math.floor(100000 + Math.random()*900000).toString()
}

async function sendVerificationEmail(email,otp){

    try {

        const transporter = nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure:false,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            },
            tls: {
                rejectUnauthorized: false, // Bypass self-signed certificate issues
              },
            
        })

        const info= await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Verify your account",
            text:`Your OTP is ${otp}`,
            html:`<b>Your OTP:${otp}</b>`
        })
        
        return info.accepted.length>0
        
    } catch (error) {
        console.error("Error sending email",error)
        return false
    }
}

const securePassword = async (password)=>{

    try {

        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
        
    } catch (error) {
        
    }
}


const otp = async(req,res)=>{

    const { otp } = req.body;
   const user = req.session.userData
   console.log(user)
    try {
 
  console.log('user entered data',otp);
  console.log("session otp",req.session.userOtp)
  
      if(otp==req.session.userOtp){
          
          
          const passwordHash = await securePassword(user.password)
          console.log(passwordHash)
          const saveUserData = new User({
              name:user.name,
              email:user.email,
              phone:user.phone,
              password:passwordHash
            })
            await saveUserData.save();
            
            
            req.session.userOtp=null
            req.session.userData=null

            req.session.user=saveUserData._id
            res.json({ success: true });
        }else{
        res.status(400).json({success:false,message:"Invalid OTP, Please try again"})
      }
  
       
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
      
} 

const resendOTP = async(req,res)=>{

    try {

        const email=req.body.email || req.session.email
        const otp = generateOtp()

        const emailSent = await sendVerificationEmail(email,otp)
    
        if(!emailSent){
            console.log("Email sending failed!");
            return res.render("otp", { message: "Failed to send OTP. Try again." });
        }

        req.session.userOtp=otp
        res.redirect("/otp",{message:"otp has sent to your email"})
        console.log("OTP sent",otp );
        }
        
    catch (error) {
        
        console.error('Error resending OTP:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }

}

const logout = async(req,res)=>{

    try {

        if (req.session) {

            req.session.user = null; 
        }

        return res.redirect("/")
        
    } catch (error) {
        
        console.log("Unable to logout",error);
        res.status(500).send("Server Error")
    }
}


const pageNotFound = async(req,res)=>{

    try {

        res.render("page-404")
        
    } catch (error) {
        
        res.redirect("/pageNotFound")
    }
}


const singleProduct = async(req,res)=>{
    try {
            const user=req.session.user
       
        const proId = req.params.id        
        const pro = await Product.findById(proId).populate('category')

        const related = await Product.find({category:pro.category._id,_id:{$ne:pro._id}}).limit(4)
        console.log(related);

        let message=null

        console.log("quantity",pro.quantity);   
        if(pro.quantity==0){
            message="Out of Stock"
        }

        res.render('newSingle',{user,product:pro,related,message})

    } catch (error) {
        res.status(500).send("Internal server error")
        console.log(error);
        
    }
}

const newSingle = async(req,res)=>{
    try {
        res.render("newSingle")
    } catch (error) {
        res.status(500).send("Internal server error")
    }
}

const getUserProfile = async(req,res)=>{
    try {
        
        const userId = req.session.userData._id
        console.log("user id " + userId)
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const user =  await User.findById(userId) 
        if (!user) {
            return res.redirect("/pageNotFound");
        }

        const err = req.session.error
        res.render("userProfile",{user,err}) 

    } catch (error) {
        res.status(500).send("Internal server error")
        console.log(error);
    }
}

const userProfile = async(req,res)=>{

   try {
    const {name,phone,password,newPass,conPass} = req.body
    const userId = req.session.user
    console.log("userrrrrrrrrrrrrrrrrrrrrr",req.session.user);

    const user= await User.findByIdAndUpdate(userId,{name,phone})    

    if(password){

        console.log("password",password);
        
        const isMatch = await bcrypt.compare(password,user.password)
        console.log(userId.password)
        if(!isMatch){
            return res.render("userProfile",{err:"Incorrect password"})
        }
        console.log("isMatch",isMatch)

        if(newPass!==conPass){
            return res.render("userProfile",{err:"Passwords doesn't match"})
        }

        const hash = await bcrypt.hash(newPass,10)
        await User.findByIdAndUpdate(userId,{password:hash})

    }
    
    await user.save()
    res.redirect("/")

   } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error")
    
   }
}

router.post('/upload-profile-image', (req, res) => {
    upload.single('profileImage')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const userId = req.user.id; // Get user ID (replace with your auth logic)
            const filePath = `/uploads/${req.file.filename}`;

            // Update user profile with the file path
            await User.findByIdAndUpdate(userId, { profileImage: filePath });

            res.status(200).json({
                message: 'File uploaded and profile updated successfully!',
                filePath: filePath,
            });
        } catch (error) {
            res.status(500).json({ error: 'Database update failed' });
        }
    });
});

const passUpdate = async(req,res)=>{
    try {
        const {password,newPass,conPass} = req.body
        const userId = req.session.user
        const user =  await User.findById(userId) 

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.render("userProfile",{err:"Incorrect password"})
        }
        console.log("isMatch",isMatch)

        if(newPass!==conPass){
            return res.render("userProfile",{err:"Passwords doesn't match"})
        }

        const hash = await bcrypt.hash(newPass,10)
        await User.findByIdAndUpdate(userId,{password:hash})

        return res.redirect("/")

    } catch (error) {
        res.status(500).send("Internal server error")
    }
    
}


module.exports={
    loadHomePage,
    loadSignup,
    pageNotFound,
    signup,
    otp,
    logout,
    resendOTP,
    login,
    loadLogin,
    singleProduct,
    newSingle,
    getUserProfile,
    userProfile,
    passUpdate,
}

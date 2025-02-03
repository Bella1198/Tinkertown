const User=require("../../models/userSchema")
const env=require("dotenv").config()
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")


const loadHomePage = async(req,res)=>{
    try {

        const userId = req.session.user;
        console.log(userId);
        
        if(!userId){
         return res.render('home',{user:null})
    }
    const findUser = await User.findOne({_id:userId});
    console.log(findUser);
    
    res.render("home",{user:findUser})
     
        
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
        

        if(user){

            const isMatch = await bcrypt.compare(password,user.password)

                if(isMatch){

                    console.log("Passwords match!")

                    req.session.user =user._id;

                    res.redirect("/")

                }else{

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
            res.redirect('/')
        }
        return res.render("signup")
        
    } catch (error) {
        
        console.log("Home page not loading:",error);
        res.status(500).send("Server Error")
        
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
        return res.render("signup",{message:"User with this email already exists"})
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


module.exports={
    loadHomePage,
    loadSignup,
    pageNotFound,
    signup,
    otp,
    logout,
    resendOTP,
    login,
    loadLogin   
}
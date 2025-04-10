const express=require("express")
const router = express.Router()
const userController = require("../controllers/user/userController")
const passport = require("passport")
const {userAuth} = require("../middlewares/auth")
const { profile } = require("console")
const upload = require("../config/multerConfig")


router.get("/",userController.loadHomePage)
router.get("/singleProduct/:id",userAuth,userController.singleProduct)
router.get("/signup",userController.loadSignup)
router.get("/pageNotFound",userController.pageNotFound)
router.post("/signup",userController.signup)
router.post("/otp",userController.otp)
router.post("/resendOTP",userController.resendOTP)
router.get("/login",userController.loadLogin)
router.post("/login",userController.login)
router.get("/logout",userController.logout)
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))

router.get('/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
   const user = req?.user;
   if (user) {
      req.session.user = user._id
      req.session.userData = user
   }
   res.redirect('/')
})
router.get("/newSingle",userController.newSingle)


// User profile
router.get("/userProfile",userController.getUserProfile)
router.post("/userProfile/:id",userController.userProfile)
router.post("/userProfile/:id",upload.single('profileImage'),userController.userProfile)

module.exports=router
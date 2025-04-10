const express = require("express")
const app = express()
const path=require("path")
const env = require("dotenv").config()
const session = require("express-session")
const passport= require("./config/passport")
// env.config()
const db = require("./config/db")
const userRouter=require("./routes/userRouter")
const adminRouter= require("./routes/adminRouter")
db()

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use((req,res,next)=>{
    res.set("cache-control","no-store")
    next()
})

app.set("view engine","ejs")
app.set("views",[path.join(__dirname,"views/user"),path.join(__dirname,"views/admin")])
app.use(express.static('public'))


app.use("/",userRouter)
app.use("/admin",adminRouter)

// Middleware to serve static files
app.use('/uploads', express.static('public/uploads'));

// Use the upload route
app.use('/api', uploadRoute);

app.listen(process.env.PORT,()=>{
    console.log("Server running")
})

module.exports=app

const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin/adminController")
const customerController = require("../controllers/admin/customerController")
const categoryController = require("../controllers/admin/categoryController")
const {userAuth,adminAuth} = require("../middlewares/auth")


router.get("/pageError",adminController.pageError)
router.get("/adminLogin",adminController.loadLogin)
router.post("/adminLogin",adminController.login)
router.get("/dashboard",adminAuth,adminController.loadDashboard)
router.get("/logout",adminController.logout)

// Customer Management
router.get("/users",adminAuth,customerController.customerInfo)

// Category Management
router.get("/categories",adminAuth,categoryController.categoryList)
router.post("/categories",adminAuth,categoryController.addCategory)
router.post("/categories",adminAuth,categoryController.listOrUnlist)


module.exports = router
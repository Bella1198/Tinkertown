const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin/adminController")
const customerController = require("../controllers/admin/customerController")
const categoryController = require("../controllers/admin/categoryController")
const productController = require("../controllers/admin/productController")

const {userAuth,adminAuth} = require("../middlewares/auth")


router.get("/pageError",adminController.pageError)
router.get("/adminLogin",adminController.loadLogin)
router.post("/adminLogin",adminController.login)
router.get("/dashboard",adminAuth,adminController.loadDashboard)
router.get("/logout",adminController.logout)

// Customer Management
router.get("/users",adminAuth,customerController.customerInfo)

// Category Management
router.get("/category",adminAuth,categoryController.categoryList)
router.get("/addCategory",adminAuth,categoryController.getAddCategory)
router.post("/category",adminAuth,categoryController.addCategory)
router.post("/category",adminAuth,categoryController.listOrUnlist)
router.get("/editCategory/:id",adminAuth,categoryController.getEdit)

//Product Management
router.get("/products",adminAuth,productController.productList)


module.exports = router
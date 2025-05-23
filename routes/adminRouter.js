const express = require("express")
const router = express.Router()
const upload = require("../config/multerConfig")
const adminController = require("../controllers/admin/adminController")
const customerController = require("../controllers/admin/customerController")
const categoryController = require("../controllers/admin/categoryController")
const productController = require("../controllers/admin/productController")

const {adminAuth} = require("../middlewares/auth")


router.get("/pageError",adminController.pageError)
router.get("/adminLogin",adminController.loadLogin)
router.post("/adminLogin",adminController.login)
router.get("/dashboard",adminAuth,adminController.loadDashboard)
router.get("/logout",adminController.logout)

// Customer Management
router.get("/users",adminAuth,customerController.customerInfo)
router.post("/toggleBlockCustomer", adminAuth, customerController.toggleBlockCustomer);

// Category Management
router.get("/category",adminAuth,categoryController.categoryList)
router.get("/addCategory",adminAuth,categoryController.getAddCategory)
router.post("/addcategory",adminAuth,categoryController.addCategory)
router.post("/statusChange",adminAuth,categoryController.listOrUnlist)
router.get("/editCategory/:id",adminAuth,categoryController.getEdit)
router.post("/editCategory/:id",adminAuth,categoryController.editCategory)

//Product Management
router.get("/products",adminAuth,productController.productList)
router.get("/addProduct",adminAuth,productController.getAddProduct)
router.post("/addProduct",adminAuth,upload.array("productImages"),productController.AddProduct)
router.post("/proStatusChange",adminAuth,productController.listOrUnlist)
router.get("/editProduct/:id",adminAuth,productController.getEditProduct)
router.post("/editProduct/:id",adminAuth,upload.array('productImages', 4),productController.editProduct)


module.exports = router
const express = require("express");
const router = express.Router();
const controller=require('../../controllers/empcontroller')
const fileUpload=require('../../middleware/fileupload');
const empmodels = require("../../models/empmodels");


router.get('/profile/:id',controller.profile)
router.put('/updateprofile/:id',fileUpload.single('profile'),controller.updateProfile)
router.post('/addlogin',controller.employeeAttendence)
router.put('/addlogout',controller.updateLogout)
router.post('/leave/:id',controller.leaveRequest)
router.post('/vendor/:id',controller.addVendor)
router.get('/getvendor/:id',controller.getVendorsByEmpId)
router.get('/getallvendors',controller.getAllVendors)
router.get('/getemp/:id',controller.dropdownEmployees)
router.post('/product/:id',controller.addToCart)
router.get('/getproducts/:id',controller.getProducts)
router.post('/vendor/addtocart/:id',controller.addToCartByVendor)
router.put('/verifyorder/:verify_id/:id',controller.verifyOrder)
router.put('/dispatchorder/:dispatch_id/:id',controller.dispatchOrder)
router.post('/deliver',controller.orderDetails)
router.put('/order/payment/:vendor_id/:id',controller.orderPayment)
router.post('/order/return/:vendor_id',controller.returnProduct)
router.put('/order/returnverify/:dispatcher_id/:return_id',controller.updateReturnProduct)
router.get('/order/pagination/:vendorId',controller.getOrderpagination)
router.post('/review/:vendorId/:productId',controller.addReview)
router.put('/review/update/:reviewId',controller.updateReview)
router.delete('/review/delete/:reviewId',controller.deleteReview)
router.get('/review/get/:productId',controller.getReviewsByProductID)
module.exports = router;
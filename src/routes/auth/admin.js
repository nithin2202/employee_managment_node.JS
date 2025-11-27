const express = require("express");
const router = express.Router();
const controller=require('../../controllers/empcontroller')
const fileUpload=require('../../middleware/fileupload')



router.post('/addemp/:id',fileUpload.single('check_upload'),controller.addemployee)
router.get('/getall/:id',controller.getAllEmployees)
router.get('/managers/:admin_id/:id/:role_id',controller.getAllManagers)
router.post('/addvendor/:id',controller.adminVendor)
router.get('/getvendor/:id',controller.getadminVedors)
router.post('/addproduct/:id',fileUpload.array('product_image',3),controller.addProduct)
router.put('/updateproduct/:id',fileUpload.array('product',3),controller.updateProduct)
router.put('/updateproduct1/:imageid',fileUpload.single('product'),controller.updateSingleImage)
router.put('/leavestatus/:id',controller.leaveApproval)
router.get('/getpackage/:id',controller.getPackageForCompany)
router.post('/addTeam/:id',controller.createRoleTypes)
router.post('/addproduction/:id',controller.createProduction)
router.post('/addbrandowner/:id',controller.createBrandOwnerByManufactur)
router.post('/addmanufactureproduct/:id',fileUpload.array('product',3),controller.createManufactureProduct)

module.exports = router;
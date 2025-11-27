const express = require("express");
const router = express.Router();
const controller=require('../../controllers/empcontroller')
const fileUpload=require('../../middleware/fileupload');


router.post('/addcategory/:id',controller.addCategories)
router.get('/getcategory/:id',controller.getCategories)
router.post('/addcompany/:id',controller.addCompanyDetails)
router.post('/addproduct/:id',fileUpload.array('product',3),controller.addMgmtProduct)
router.get('/getproduct/:id',controller.getMgmtProduct)
router.post('/addpackage/:id',controller.packageCreation)
module.exports=router
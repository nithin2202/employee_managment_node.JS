const express = require("express");
const router = express.Router();
const controller=require('../../controllers/empcontroller')
const fileUpload=require('../../middleware/fileupload')

router.post('/addemp/:id',controller.addemployee)
router.get('/getall/:id',controller.getAllEmployees)
router.get('/profile/:id',controller.profile)
router.put('/updateprofile/:id',fileUpload.single('profile'),controller.updateProfile)
router.post('/addlogin',controller.employeeAttendence)
router.put('/addlogout',controller.updateLogout)
router.post('/leave/:id',controller.leaveRequest)
router.put('/leavestatus/:id',controller.leaveApproval)


module.exports = router;
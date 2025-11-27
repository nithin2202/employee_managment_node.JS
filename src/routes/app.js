const express=require("express");
const router=express.Router();



//auth
router.use("/auth/emp",require('./auth/employee'));
router.use("/auth/admin",require('./auth/admin'))
router.use('/auth/mgmt',require('./auth/managment'))

//unauth
router.use("/unauth",require('./unAuth/unAuth'))

router.use((req, res, next) => {
  res.status(404).json({ message: 'You are not authorized to access this api' });
});

 module.exports=router;
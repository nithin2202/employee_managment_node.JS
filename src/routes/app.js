const express=require("express");
const router=express.Router();



//auth
router.use("/auth",require('./auth/employee'));

//unauth
router.use("/unauth",require('./unAuth/unAuth'))

router.use((req, res, next) => {
  res.status(404).json({ message: 'You are not authorized to access this api' });
});

 module.exports=router;
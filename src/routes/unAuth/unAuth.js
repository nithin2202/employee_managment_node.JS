const express=require('express')
const router=express.Router()
const controller=require('../../controllers/empcontroller')

router.get('/login',controller.emplogin)
//router.post('/check',controller.checkAnswers)
router.post('/user',controller.checkUser)
router.post('/answers',controller.checkQuestions)
router.put('/password',controller.createNewPassword)
router.post('/question',controller.createQuestion)
router.put('/updatequestion/:id',controller.updateQuestion)
router.get('/getquestion/:id',controller.getQuestion)
router.get('/getallquestions',controller.getAllQuestions)
router.delete('/deletequestion/:id',controller.deleteQuestion)

module.exports=router
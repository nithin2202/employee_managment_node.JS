let Joi = require("joi");
let bcrypt = require("bcrypt")
let empmodels = require('../models/empmodels');
const moment = require("moment");
const fileValidate = require("../utils/filevalidate");
const { copyFile, deleteFile } = require("../utils/copy");
const path = require('path');
const { json } = require("stream/consumers");
const { wrap } = require("module");
let employee = {
    addemployee: async (req, res) => {


        let formvalidation = Joi.object({
            name: Joi.string().max(100).required(),
            email: Joi.string().email().max(100).required(),
            contact: Joi.string().required().min(10),
            address: Joi.string().max(500),
            role: Joi.string().min(1).max(30).required(),
            designation: Joi.string().min(1).max(30).required(),
            hired_location: Joi.string().max(50).required(),
            experience: Joi.number().precision(1).min(0).max(50),
            username: Joi.string().min(3).max(16).pattern(/^[a-zA-Z0-9]+$/).required(),
            password: Joi.string().min(6).max(15).pattern(/^[A-Z][a-zA-Z0-9]+$/).required(),
            sales_target: Joi.number().precision(2).min(0),
            comm: Joi.number().precision(2).min(0),
            TA: Joi.number().precision(2).min(0).optional(),
            DA: Joi.number().precision(2).min(0).optional(),
        })



        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        }
        try {
            let { id } = req.params
            let { password } = req.body

            let hashedPassword = await bcrypt.hash(password, 10)
            let admin = await empmodels.getAdminData(id)
            if (admin.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'admin cannot found' }
            } else {
                let employee = {
                    ...req.body, password: hashedPassword, admin_id: id, created_date: moment().format('YYYY-MM-DD HH:mm:ss'), updated_date: moment().format('YYYY-MM-DD HH:mm:ss')
                }

                const Email = await empmodels.checkEmail(req.body.email)
                const user = await empmodels.checkUsername(req.body.username)
                const mobile = await empmodels.checkContact(req.body.contact)
                if (Email.length > 0) {
                    throw { errorCode: 'validation', message: 'email alredy exist' }
                }
                else if (user.length > 0) {
                    throw { errorCode: 'validation', message: 'username alredy exist' }
                }
                else if (mobile.length > 0) {
                    throw { errorCode: 'validation', message: 'mobilenumber alredy exist' }
                }
                else {
                    let emp = await empmodels.addemp(employee)


                    if (emp.length == 0) {
                        throw { errorCode: 'DB_ERROR', message: 'cannot add the employee' }
                    }
                }

                return res.status(201).json({ message: 'employee added', data: req.body })
            }
        } catch (error) {
            return res.status(422).json({ message: error.message })
        }

    },
    getAllEmployees: async (req, res) => {
        try {
            let { id } = req.params
            const admin = await empmodels.getAdminData(id)
            if (!admin || admin.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'cannot found the admin' }
            } else {
                const emp = await empmodels.getAllEmps(id)
                if (!emp || emp.length == 0) {
                    throw { errorCode: 'DB_ERROR', message: 'cannot add the employee' }
                }
                res.status(200).json({ data: emp })
            }
        } catch (error) {
            return res.status(422).json({ message: error.message })
        }

    },
    emplogin: async (req, res) => {
        let formvalidation = Joi.object({
            username: Joi.string().min(3).max(16).pattern(/^[a-zA-Z0-9]+$/).required(),
            password: Joi.string().min(6).max(15).pattern(/^[A-Z][a-zA-Z0-9]+$/).required()
        })
        const { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ message: errorDetails })
        }
        try {
            let { username, password } = req.body
            let login = await empmodels.login(username)
            if (login.length == 0) {
                throw { errorCode: "validation", message: "Invalid User Name." };
            }
            const check = await bcrypt.compare(password, login[0].password)
            console.log(check);
            if (check) {
                return res.status(200).json({
                    message: login[0],
                })
            } else {
                throw { errorCode: "validation", message: 'invalid password' }
            }

        } catch (error) {

            if (error.errorCode === "validation") {
                return res.status(422).json({
                    message: error.message,
                })
            } else {
                return res.status(409).json({
                    message: error.message,
                })
            }

        }

    },

    checkUser: async (req, res) => {
        let formvalidation = Joi.object({
            username: Joi.string().min(3).max(16).required()
        })
        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                const { username } = req.body
                const user = await empmodels.checkUsername(username)
                if (user.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'user not exist' }
                }
                return res.status(200).json({ message: 'user exist', data: user })
            } catch (error) {
                if (error.errorCode === 'VALID_ERROR') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }
            }
        }
    },
    checkQuestions: async (req, res) => {
        let formvalidation = Joi.object({
            username: Joi.string().min(3).max(16).required(),
            answers: Joi.array().items(Joi.object({ qid: Joi.number().required(), answer: Joi.string().min(3).required().pattern(/^[a-zA-Z0-9]+$/) }))
        }).required()
        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                const { answers, username } = req.body


                const user = await empmodels.checkUsername(username)
                if (user.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'user not found' }
                }
                const employee = user[0]
                if (employee.security_attempts >= 3 && employee.last_attempt) {
                    console.log(moment().minutes());
                    const minutesPassed = moment().diff(employee.last_attempt, 'minutes')
                    if (minutesPassed < 180) {
                        return res.status(429).json({ message: `your account is locked you can try after ${180 - minutesPassed} minutes` })
                    } else {
                        const reset = await empmodels.resetSecurityQuestions(employee.id)
                        console.log('reset:', reset);
                    }
                }
                for (let i = 0; i < answers.length; i++) {
                    let dbQuestions = await empmodels.getQuestions(answers[i].qid)
                    console.log(dbQuestions);

                    let dbAnswer = await empmodels.getAnswers(answers[i].qid)
                    console.log(dbAnswer);

                    if (dbQuestions.length == 0) {
                        throw { errorCode: 'VALID_ERROR', message: 'question not found' }
                    }
                    else if (dbAnswer.length == 0) {
                        throw { errorCode: 'VALID_ERROR', message: 'answer not found' }
                    }
                    else if (dbAnswer[0].answer != answers[i].answer) {
                        //throw {errorCode:'VALID_ERROR',message:'invalid answers'}
                        await empmodels.increaseAttempt(employee.id, employee.security_attempts + 1, moment().format());
                        return res.status(401).json({
                            message: 'Incorrect answer. Please check and try again carefully.'
                        })
                    }

                }
                const reset = await empmodels.resetSecurityQuestions(employee.id);
                return res.status(200).json({ message: 'answers matched' })
            } catch (error) {
                if (error.errorCode === 'VALID_ERROR') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }

            }
        }
    },
    createNewPassword: async (req, res) => {
        let formvalidation = Joi.object({
            username: Joi.string().min(3).max(16).required(),
            newPassword: Joi.string().min(6).max(15).pattern(/^[A-Z][a-zA-Z0-9]+$/).required(),
            confirmPassword: Joi.string().min(6).max(15).pattern(/^[A-Z][a-zA-Z0-9]+$/).required().valid(Joi.ref('newPassword'))
        })
        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { username, newPassword, confirmPassword } = req.body

                const user = await empmodels.checkUsername(username)
                let compare = await bcrypt.compare(newPassword, user[0].password)
                console.log(compare);
                if (compare) {
                    throw { errorCode: 'VALID_ERROR', message: 'old password and new password cannot be same' }
                }

                if (user.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'cannot found the user' }
                }
                const hashedPassword = await bcrypt.hash(newPassword, 10)
                let updatePassword = await empmodels.updatePassword(username, hashedPassword)
                if (updatePassword.length == 0) {
                    throw ({ errorCode: 'VALID_ERROR', message: 'cannot update password' })
                }
                return res.status(200).json({ data: { username, newPassword }, message: 'password updated' })


            } catch (error) {
                if (error.errorCode === 'validation') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }
            }
        }
    },
    createQuestion: async (req, res) => {
        let formvalidation = Joi.object({
            question: Joi.string().min(10).max(500).pattern(/^[a-zA-Z0-9\s.,?'-]+$/).required()
        })
        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { question } = req.body
                console.log('que', question);

                if (!question) {
                    throw { errorCode: 'VALID_ERROR', message: 'cannot found the question' }
                }
                let result = await empmodels.createQuestion(question)
                console.log('res', result);

                if (result.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'cannot create a question' }
                }
                return res.status(200).json({ message: 'created succesfully', data: question })
            } catch (error) {
                if (error.errorCode === 'VALID_ERROR') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }

            }
        }

    },

    getQuestion: async (req, res) => {
        try {
            let { id } = req.params
            if (!id) {
                throw { errorCode: 'VALID_ERROR', message: 'cannot get the id' }
            }
            let question = await empmodels.getQuestionById(id)
            if (!question || question.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'cannot found the quesion' }
            }
            return res.status(200).json({ message: 'question fetched succesfully', data: question })
        } catch (error) {
            if (error.errorCode === 'VALID_ERROR') {
                return res.status(422).json({
                    message: error.message
                })
            } else {
                return res.status(409).json({
                    error: error.message
                })
            }
        }
    },
    getAllQuestions: async (req, res) => {
        try {
            let questions = await empmodels.getAllQuestions()
            // if(questions.length==0){
            //     throw {errorCode:'VALID_ERROR',message:'cannot found the questions'}
            // }
            return res.status(200).json({ message: 'all quesions fetched succesfully', data: questions })
        } catch (error) {
            if (error.errorCode === 'VALID_ERROR') {
                return res.status(422).json({
                    message: error.message
                })
            } else {
                return res.status(409).json({
                    error: error.message
                })
            }
        }
    },
    updateQuestion: async (req, res) => {
        let formvalidation = Joi.object({
            question: Joi.string().min(10).max(500).pattern(/^[a-zA-Z0-9\s.,?'-]+$/).required()
        })
        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                let { question } = req.body
                if (!question) {
                    throw { errorCode: 'VALID_ERROR', message: 'provide question' }
                }
                let checking = await empmodels.getQuestionById(id)
                if (checking.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'cannot found the question' }
                }
                let result = await empmodels.updateQuestion(question, id)
                if (result.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'cannot update the question' }
                }
                return res.status(200).json({ message: 'update succesfully', data: req.body })

            } catch (error) {
                if (error.errorCode === 'VALID_ERROR') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }
            }
        }

    },
    deleteQuestion: async (req, res) => {
        try {
            let { id } = req.params
            if (!id) {
                throw { errorCode: 'VALID_ERROR', message: 'cannot get the id' }
            }
            let deleteQue = await empmodels.deleteQuestion(id)
            console.log(deleteQue);
            if (!deleteQue) {
                throw { errorCode: 'VALID_ERROR', message: 'cannot delete the question' }
            }

            return res.status(200).json({ message: 'question deleted succesfully' })

        } catch (error) {
            if (error.errorCode === 'VALID_ERROR') {
                return res.status(422).json({
                    message: error.message
                })
            } else {
                return res.status(409).json({
                    error: error.message
                })
            }
        }
    },
    profile: async (req, res) => {
        try {
            let { id } = req.params
            if (!id) {
                throw { errorCode: 'VALID_ERROR', message: 'id required' }
            }
            const employee = await empmodels.getEmployeeById(id)
            if (employee.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'cannot get the employee' }
            }
            return res.status(200).json({ message: 'profile details fetced succesfully', data: employee })
        } catch (error) {
            if (error.errorCode === 'VALID_ERROR') {
                return res.status(422).json({
                    message: error.message
                })
            } else {
                return res.status(409).json({
                    error: error.message
                })
            }
        }
    },
    updateProfile: async (req, res) => {

        console.log(moment().format());

        let formvalidation = Joi.object({
            name: Joi.string().max(100).required(),
            contact: Joi.string().required().min(10),
            address: Joi.string().max(500).required(),
        })
        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))

        }
        let validate;
        if (req.file) {
            validate = fileValidate(req.file, [".jpg", ".jpeg", ".png", ".webp"], 2)
            if (!validate.valid) {
                errorDetails.push({
                    field: 'image',
                    message: validate.message
                })
            }
        }


        if (errorDetails.length > 0) {
            return res.status(422).json({ message: errorDetails })
        } else {
            try {
                let { id } = req.params
                const employee = await empmodels.getEmployeeById(id)
                if (employee.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'employee not found' }
                }
                const updatedData = {
                    name: req.body.name,
                    contact: req.body.contact,
                    address: req.body.address,
                    image_url: req.file.filename
                }
                const mobile = await empmodels.checkContact(req.body.contact)
                if (mobile.length > 0) {
                    if (mobile[0].id == employee[0].id) {
                        const updateEmp = await empmodels.updateEmployee(id, updatedData)
                        if (updateEmp.length == 0) {
                            throw { errorCode: 'API_ERROR', message: 'cannot update employee' }
                        }
                    } else {
                        throw { errorCode: 'VALID_ERROR', message: 'mobilenumber alredy exist' }
                    }
                }
                const folder = `profile`
                await copyFile(req.file, folder)
                console.log(employee[0].image_url);

                if (employee[0].image_url) {
                    const update = await empmodels.uploadImage(id, updatedData)
                    if (update.length == 0) {
                        throw { errorCode: 'API_ERROR', message: 'cannot update the given data' }
                    }

                    const joindedPath = path.join(__dirname, '..', 'uploads', 'profile', employee[0].image_url)
                    await deleteFile(joindedPath);

                    return res.status(200).json({ message: 'updated succesfully' });
                }


                const updateEmp = await empmodels.updateEmployee(id, updatedData)
                if (updateEmp.length == 0) {
                    throw { errorCode: 'API_ERROR', message: 'cannot update employee' }
                }
                return res.status(200).json({ message: 'updated succesfully' })
            } catch (error) {
                if (error.errorCode === 'VALID_ERROR') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else if (error.errorCode === 'API_ERROR') {
                    return res.status(409).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }
            }
        }
    },
    employeeAttendence: async (req, res) => {
        let formvalidation = Joi.object({
            id: Joi.number().integer().required(),
            status: Joi.string().required()
        })
        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                const { id } = req.body
                let employee = await empmodels.getEmployeeById(id)
                if (employee.length == 0) {
                    throw { errorCode: 'API_ERROR', message: 'cannot get the details of employee' }
                }
                const today = moment().format('YYYY-MM-DD')
                const exist = await empmodels.getTodayAttendence(id, today)
                if (exist.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'alredy logged in' }
                }

                const data = {
                    employee_id: id,
                    login_time: moment().format('YYYY-MM-DD HH:mm:ss'),
                    attendance_date: today,
                    status: req.body.status
                }
                const login = await empmodels.addAttendence(id, data)
                if (login.length == 0) {
                    throw { errorCode: 'API_ERROR', message: 'cannot add the login details' }
                }
                return res.status(201).json({ message: 'employee succesfully loggedin and attendence has been taken' })


            } catch (error) {
                if (error.errorCode === 'VALID_ERROR') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else if (error.errorCode === 'API_ERROR') {
                    return res.status(409).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }
            }
        }
    },
    updateLogout: async (req, res) => {
        let formvalidation = Joi.object({
            id: Joi.number().integer().required()
        })
        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                const { id } = req.body
                let employee = await empmodels.getEmployeeById(id)
                if (employee.length == 0) {
                    throw { errorCode: 'API_ERROR', message: 'cannot get the details of employee' }
                }
                const today = moment().format('YYYY-MM-DD')
                const record = await empmodels.getTodayAttendence(id, today)
                if (record.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'employee not login today' }
                }
                if (record[0].logout_time) {
                    throw { errorCode: 'VALID_ERROR', message: 'employee alredy logout today' }
                }
                const logoout = moment().format('YYYY-MM-DD HH:mm:ss')
                let difference = new Date(logoout) - record[0].login_time
                console.log(difference);
                let diffInSeconds = difference / 1000;
                let hours = Math.floor(diffInSeconds / 3600);
                let minutes = Math.floor((diffInSeconds % 3600) / 60);
                let seconds = diffInSeconds % 60;
                console.log(`difference:${hours}h ${minutes}m ${seconds}s`);
                totalHours = `${hours}h ${minutes}m ${seconds}s`
                const updateData = {
                    logout_time: moment().format('YYYY-MM-DD HH:mm:ss'),
                    total_hours: totalHours
                }
                const result = await empmodels.updateAttendence(id, today, updateData)
                if (result.length == 0) {
                    throw { errorCode: 'API_ERROR', message: 'cannot update the logout details' }
                }
                return res.status(200).json({ message: 'logout detaild updated succesfully' })
            } catch (error) {
                if (error.errorCode === 'VALID_ERROR') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else if (error.errorCode === 'API_ERROR') {
                    return res.status(409).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }
            }
        }
    },
    leaveRequest: async (req, res) => {
        let formvalidation = Joi.object({
            start_date: Joi.date().min('now').required(),
            end_date: Joi.date().greater(Joi.ref('start_date')).required(),
            reason:Joi.string().required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        }else{
            try {
                let {id}=req.params
                let {start_date,end_date,reason}=req.body
                console.log(req.body);
                
                const employee=await empmodels.getEmployeeById(id)
                if(employee.length==0){
                    throw { errorCode: 'API_ERROR', message: 'cannot get the details of employee' }
                }
                 const overlap=await empmodels.checkOverlap(id,start_date,end_date)
                console.log(overlap);
                
                if(overlap.length>0){
                    throw {errorCode:'VALID_ERROR',message:'alredy applied on that day waiting for the approval'}
                }
                const total=new Date(end_date)-new Date(start_date)
                const totalDays = total / (1000 * 60 * 60 * 24)+1;
                console.log(typeof total);
                const data={
                    employee_id:id,
                    start_date,
                    end_date,
                    reason,
                    total_days:totalDays
                }
                const request=await empmodels.leave(id,data)
                if(request.length==0){
                    throw { errorCode: 'API_ERROR', message: 'cannot send the leave request' }
                }
                return res.status(201).json({message:'leave request send succeesfully',data:request})
                
                
            } catch (error) {
                 if (error.errorCode === 'VALID_ERROR') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else if (error.errorCode === 'API_ERROR') {
                    return res.status(409).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }
            }
        }
    },
    leaveApproval:async(req,res)=>{
        let formvalidation=Joi.object({
            status:Joi.string().required(),
            remarks:Joi.string().min(5).optional()
        })
        let validation=formvalidation.validate(req.body,{errors:{wrap:{label:false}},abortEarly:false})
         let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        }
      else{
            try {
                let {id}=req.params
                let {status,remarks}=req.body
                const getLeave=await empmodels.getLeaveById(id)
                console.log('employee id:',getLeave[0].employee_id);
                console.log('total days:',getLeave[0].total_days);
                
                const employee=await empmodels.getEmployeeById(getLeave[0].employee_id)
                if(employee.length==0){
                    throw {errorCode:'API_ERROR',message:'employee not found'}
                }
                const {total_leaves,remaining_leaves,leaves_taken}=employee[0]
                if(getLeave.length==0){
                    throw {errorCode:'API_ERROR',message:'there is no leave request for the given id'}
                }
                console.log(getLeave[0].status);
                
                if(getLeave[0].status!='Pending'){
                    throw {errorCode:'VALID_ERROR',message:'admin alredy reacted for the leave'}
                }
               
                const check=['Approved','Rejected']
                if(!check.includes(status)){
                  throw {errorCode:'API_ERROR',message:'invalid status'}
                }
                if(status=='Approved'){
                    const updatedData={
                        status,
                        admin_remarks:remarks||null
                    }
                    const approveLeave=await empmodels.leaveStatus(id,updatedData)
                    const days_taken=getLeave[0].total_days+leaves_taken
                    const remaining=remaining_leaves-getLeave[0].total_days
                    console.log(remaining);
                    const data={
                        leaves_taken:days_taken,
                        remaining_leaves:remaining
                    }
                    const updateLeaves=await empmodels.updateLeaves(employee[0].id,data)
                    if(updateLeaves.length==0){
                        throw {errorCode:'API_ERROR',message:'cannot update leaves for employee '}
                    }
                    
                    return res.status(200).json({message:'leave approved succesfully'})
                }
                else if(status=='Rejected'){
                    const data={
                        status,
                        admin_remarks:remarks
                    }
                    const rejectLeave=await empmodels.leaveStatus(id,data)
                    if(rejectLeave.length==0){
                         throw {errorCode:'API_ERROR',message:'cannot update the status'}
                    }
                    return res.status(200).json({message:'leave rejected succesfully'})
                }
                
            } catch (error) {
                 if (error.errorCode === 'VALID_ERROR') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else if (error.errorCode === 'API_ERROR') {
                    return res.status(409).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }
            }
        }
    }


}

module.exports = employee
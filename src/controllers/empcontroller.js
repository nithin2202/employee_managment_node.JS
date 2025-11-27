let Joi = require("joi");
let bcrypt = require("bcrypt")
let empmodels = require('../models/empmodels');
const moment = require("moment");
const fileValidate = require("../utils/filevalidate");
const { copyFile, deleteFile } = require("../utils/copy");
const path = require('path');
const { Verify } = require("crypto");

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
            pan_number: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(),
            alternative_number: Joi.string().min(10).invalid(Joi.ref('contact')).optional(),
            blood_group: Joi.string().min(2).required(),
            PF: Joi.number().min(0).required()
        })

        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
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
        }
        try {
            let { id } = req.params
            let { password } = req.body

            let hashedPassword = await bcrypt.hash(password, 10)
            let admin = await empmodels.getAdminData(id)
            if (admin.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'admin cannot found' }
            }
            if (req.file) {
                let employee = {
                    ...req.body, checks_upload: req.file.filename, password: hashedPassword, admin_id: admin[0].id, created_date: moment().format('YYYY-MM-DD HH:mm:ss'), updated_date: moment().format('YYYY-MM-DD HH:mm:ss')
                }
                console.log((req.file.filename));


                const Email = await empmodels.checkEmail(req.body.email)
                const user = await empmodels.checkUsername(req.body.username)
                const mobile = await empmodels.checkContact(req.body.contact)
                const pan = await empmodels.checkPan(req.body.pan_number)
                if (Email.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'email alredy exist' }
                }
                else if (user.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'username alredy exist' }
                }
                else if (mobile.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'mobilenumber alredy exist' }
                }
                else if (pan.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'PAN NUMBER alredy exist' }
                }
                else {
                    const folder = 'check'
                    await copyFile(req.file, folder)
                    await deleteFile(req.file.path)
                    let emp = await empmodels.addemp(employee)
                    if (emp.length == 0) {
                        throw { errorCode: 'API_ERROR', message: 'cannot add the employee' }
                    }
                }

                return res.status(200).json({ message: 'employee added', data: req.body })
            }
        } catch (error) {
            if (error.errorCode == 'VALID_ERROR') {
                return res.status(422).json({ message: error.message })
            }
            else {
                return res.status(409).json({ message: error.message })
            }
        }
    },
    getAllEmployees: async (req, res) => {
        try {
            let { id } = req.params
            const admin = await empmodels.getAdminData(id)
            console.log(typeof admin);

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
            if (error.errorCode = 'VALID_ERROR') {
                return res.status(422).json({ message: error.message })
            }
            else {
                return res.status(409).json({ message: error.message })
            }
        }

    },
    emplogin: async (req, res) => {
        let formvalidation = Joi.object({
            username: Joi.string().min(3).max(16).pattern(/^[a-zA-Z0-9]+$/).required(),
            password: Joi.string().min(6).max(15).pattern(/^[A-Z][a-zA-Z0-9]+$/).required()
        })
        const validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ message: errorDetails })
        }
        try {
            let { username, password } = req.body
            let login = await empmodels.login(username)
            if (login.length == 0) {
                throw { errorCode: "VALID_ERROR", message: "Invalid User Name." };
            }
            const check = await bcrypt.compare(password, login[0].password)
            console.log(check);
            if (check) {
                return res.status(200).json({
                    message: login[0],
                })
            } else {
                throw { errorCode: "VALID_ERROR", message: 'invalid password' }
            }

        } catch (error) {

            if (error.errorCode === "VALID_ERROR") {
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
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
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
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
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
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
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
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
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
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
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

        let formvalidation = Joi.object({
            name: Joi.string().max(100).required(),
            contact: Joi.string().required().min(10),
            address: Joi.string().max(500).required(),
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
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
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
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
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
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
            reason: Joi.string().required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                let { start_date, end_date, reason } = req.body
                console.log(req.body);

                const employee = await empmodels.getEmployeeById(id)
                if (employee.length == 0) {
                    throw { errorCode: 'API_ERROR', message: 'cannot get the details of employee' }
                }
                const overlap = await empmodels.checkOverlap(id, start_date, end_date)
                console.log(overlap);

                if (overlap.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'alredy applied on that day waiting for the approval' }
                }
                const total = new Date(end_date) - new Date(start_date)
                const totalDays = total / (1000 * 60 * 60 * 24) + 1;
                console.log(typeof total);
                const data = {
                    employee_id: id,
                    start_date,
                    end_date,
                    reason,
                    total_days: totalDays
                }
                const request = await empmodels.leave(id, data)
                if (request.length == 0) {
                    throw { errorCode: 'API_ERROR', message: 'cannot send the leave request' }
                }
                return res.status(201).json({ message: 'leave request send succeesfully', data: request })


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
    leaveApproval: async (req, res) => {
        let formvalidation = Joi.object({
            status: Joi.string().required(),
            remarks: Joi.string().min(5).optional()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        }
        else {
            try {
                let { id } = req.params
                let { status, remarks } = req.body
                const getLeave = await empmodels.getLeaveById(id)
                console.log('employee id:', getLeave[0].employee_id);
                console.log('total days:', getLeave[0].total_days);

                const employee = await empmodels.getEmployeeById(getLeave[0].employee_id)
                if (employee.length == 0) {
                    throw { errorCode: 'API_ERROR', message: 'employee not found' }
                }
                const { total_leaves, remaining_leaves, leaves_taken } = employee[0]
                if (getLeave.length == 0) {
                    throw { errorCode: 'API_ERROR', message: 'there is no leave request for the given id' }
                }
                console.log(getLeave[0].status);

                if (getLeave[0].status != 'Pending') {
                    throw { errorCode: 'VALID_ERROR', message: 'admin alredy reacted for the leave' }
                }

                const check = ['Approved', 'Rejected']
                if (!check.includes(status)) {
                    throw { errorCode: 'API_ERROR', message: 'invalid status' }
                }
                if (status == 'Approved') {
                    const updatedData = {
                        status,
                        admin_remarks: remarks || null
                    }
                    const approveLeave = await empmodels.leaveStatus(id, updatedData)
                    if (approveLeave.length == 0) {
                        throw { errorCode: 'API_ERROR', message: 'cannot approve or reject the leave ' }
                    }
                    const days_taken = getLeave[0].total_days + leaves_taken
                    const remaining = remaining_leaves - getLeave[0].total_days
                    console.log(remaining);
                    const data = {
                        leaves_taken: days_taken,
                        remaining_leaves: remaining
                    }
                    const updateLeaves = await empmodels.updateLeaves(employee[0].id, data)
                    if (updateLeaves.length == 0) {
                        throw { errorCode: 'API_ERROR', message: 'cannot update leaves for employee ' }
                    }

                    return res.status(200).json({ message: 'leave approved succesfully' })
                }
                else if (status == 'Rejected') {
                    const data = {
                        status,
                        admin_remarks: remarks
                    }
                    const rejectLeave = await empmodels.leaveStatus(id, data)
                    if (rejectLeave.length == 0) {
                        throw { errorCode: 'API_ERROR', message: 'cannot update the status' }
                    }
                    return res.status(200).json({ message: 'leave rejected succesfully' })
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
    },
    addVendor: async (req, res) => {
        let formvalidation = Joi.object({
            organization: Joi.string().min(5).max(30).required(),
            vendor_name: Joi.string().required(),
            address: Joi.string().required(),
            mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
            email: Joi.string().email().required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                const employee = await empmodels.getEmployeeById(id)
                if (employee.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'employee not found' }
                }
                const checkEmail = await empmodels.verifyVendorEmail(req.body.email)
                const checkContact = await empmodels.verifyVendorContact(req.body.mobile)
                if (checkEmail.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'email alredy exist' }
                }
                if (checkContact.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'contact alredy exist' }
                }
                const insertedData = {
                    employee_id: id,
                    name: req.body.vendor_name,
                    org_name: req.body.organization,
                    email: req.body.email,
                    contact: req.body.mobile,
                    location: req.body.address,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }
                const vendor = await empmodels.insertVendor(insertedData)
                if (vendor.length == 0) {
                    throw { errorCode: 'API_ERROR', message: 'issue in inserting data' }
                }
                return res.status(200).json({ message: 'vendor add succesfully', data: vendor })
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
    getVendorsByEmpId: async (req, res) => {
        try {
            let { id } = req.params
            const employee = await empmodels.getEmployeeById(id)
            if (employee.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'employee not found' }
            }
            const vendors = await empmodels.getVendrosByEmployeeId(id)
            if (vendors.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'vendors not found' }
            }
            return res.status(200).json({ data: vendors })
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
    },
    getAllVendors: async (req, res) => {
        try {
            const vendors = await empmodels.getAllVendors()
            if (vendors.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'cannot found vendors' }
            }
            return res.status(200).json({ data: vendors })
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
    },
    getAllManagers: async (req, res) => {
        try {
            let { admin_id, id, role_id } = req.params
            const admin = await empmodels.getAdminData(admin_id)
            if (admin.length == 0) {
                throw { errorCode: 'API_ERROR', message: 'admin not found' }
            }
            const employee = await empmodels.getEmployeeById(id)
            if (employee.length == 0) {
                throw { errorCode: 'API_ERROR', message: 'employee not found' }
            }
            const managers = await empmodels.getAllManagers(admin_id, role_id)
            console.log(managers);
            if (managers.length == 0) {
                throw { errorCode: 'API_ERROR', message: 'cannot get the manager details' }
            }
            const mgr = managers[0].id
            console.log(mgr);
            const manager = await empmodels.updateMgr(id, admin_id, role_id, mgr)
            if (manager.length == 0) {
                throw { errorCode: 'API_ERROR', message: 'cannot assign manager' }
            }
            return res.status(200).json({ message: 'managers assigned succesfully' })
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
    },
    dropdownEmployees: async (req, res) => {
        try {
            let { id } = req.params
            const admin = await empmodels.getAdminData(id)
            if (admin.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'admin not found' }
            }
            const employees = await empmodels.getEmpByAdminId(id)
            if (employees.length == 0) {
                throw { errorCode: 'API_ERROR', message: 'cannot found the employees' }
            }
            return res.status(200).json({ data: employees })
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
    },
    adminVendor: async (req, res) => {
        let formvalidation = Joi.object({
            emp_id: Joi.number().integer().required(),
            organization: Joi.string().min(5).max(30).required(),
            vendor_name: Joi.string().required(),
            address: Joi.string().required(),
            mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
            email: Joi.string().email().required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                const admin = await empmodels.getAdminData(id)
                if (admin.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'admin not found' }
                }
                const checkEmail = await empmodels.verifyVendorEmail(req.body.email)
                const checkContact = await empmodels.verifyVendorContact(req.body.mobile)
                if (checkEmail.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'email alredy exist' }
                }
                if (checkContact.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'contact alredy exist' }
                }
                const data = {
                    employee_id: req.body.emp_id,
                    admin_id: id,
                    name: req.body.vendor_name,
                    org_name: req.body.organization,
                    location: req.body.address,
                    contact: req.body.mobile,
                    email: req.body.email,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }
                const insert = await empmodels.insertVendor(data)
                if (insert.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'adding vendor unsuccesful' }
                }
                return res.status(200).json({ message: 'vendor added succesfully' })
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
    getadminVedors: async (req, res) => {
        try {
            let { id } = req.params
            const admin = await empmodels.getAdminData(id)
            if (admin.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'admin cannot found' }
            }
            const Vendors = await empmodels.getVendorsByAdminId(id)
            console.log(Vendors);

            if (Vendors.length == 0) {
                throw { errorCode: 'API_ERROR', message: 'there is no vendors' }
            }
            return res.status(200).json({ data: Vendors })
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
    },
    addProduct: async (req, res) => {
        let formvalidation = Joi.object({
            name: Joi.string().required(),
            category: Joi.number().integer().required(),
            description: Joi.string().required(),
            base_price: Joi.number().min(1).required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
        }
        if (!req.files || req.files.length == 0) {
            errorDetails.push({
                field: 'image',
                message: 'Atlest one image is required'
            })
        } else {
            let filevalidation;
            let totalSize = 0;
            for (let i = 0; i < req.files.length; i++) {
                filevalidation = fileValidate(req.files[i], [".jpg", ".jpeg", ".png", ".webp"], 2)
                console.log(filevalidation);
                totalSize += req.files[i].size
                if (!filevalidation.valid) {
                    errorDetails.push({
                        field: 'image',
                        message: filevalidation.message
                    })
                }
            }
            if (totalSize > 5 * 1024 * 1024) {
                errorDetails.push({
                    field: "product_image",
                    message: "Images size should not exceed 5MB"
                });
            }

        }
        if (errorDetails.length > 0) {
            return res.status(422).json({ message: errorDetails })
        } else {
            try {
                let { id } = req.params
                const admin = await empmodels.getAdminData(id)
                console.log('admin:', admin);

                if (admin.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'admin not found' }
                }
                const data = {
                    mgmt_id: admin[0].managment_id,
                    admin_id: id,
                    name: req.body.name,
                    category: req.body.category,
                    description: req.body.description,
                    base_price: req.body.base_price,
                    created_at: moment().format()
                }
                let result = []
                const product = await empmodels.addproduct(data)
                if (req.files) {
                    for (let i = 0; i < req.files.length; i++) {
                        const item = req.files[i]
                        const payload = {
                            image_url: item.filename,
                            image_type: item.mimetype,
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            product_id: product
                        }
                        console.log('payload:', payload);
                        const folder = `product_images`
                        await copyFile(req.files[i], folder)
                        const product_image = await empmodels.addProductImage(payload)
                        console.log('image:', product_image);
                        result.push(payload)
                    }
                }
                return res.status(200).json({ message: 'product added succesfully' })
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
    updateProduct: async (req, res) => {
        let formvalidation = Joi.object({
            name: Joi.string().required(),
            category: Joi.number().integer().required(),
            description: Joi.string().required(),
            base_price: Joi.number().min(1).required(),
            image_id: Joi.array().items(Joi.number().integer()).required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
        }
        if (!req.files || req.files.length == 0) {
            errorDetails.push({
                field: 'image',
                message: 'Atlest one image is required'
            })
        } else {
            let filevalidation;
            let totalSize = 0;
            for (let i = 0; i < req.files.length; i++) {
                filevalidation = fileValidate(req.files[i], [".jpg", ".jpeg", ".png", ".webp"], 2)
                console.log(filevalidation);
                totalSize += req.files[i].size
                if (!filevalidation.valid) {
                    errorDetails.push({
                        field: 'image',
                        message: filevalidation.message
                    })
                }
            }
            if (totalSize > 5 * 1024 * 1024) {
                errorDetails.push({
                    field: "product_image",
                    message: "Images size should not exceed 5MB"
                });
            }

        }
        if (errorDetails.length > 0) {
            return res.status(422).json({ message: errorDetails })
        } else {
            try {
                let { id } = req.params
                console.log(id);
                let { image_id } = req.body


                if (image_id.length != req.files.length) {
                    throw { errorCode: 'VALID_ERROR', message: 'number of images and ids must match' }
                }

                let product = await empmodels.getProductById(id)
                console.log(product);

                if (product.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'product not found' }
                }
                const payload = {
                    name: req.body.name,
                    category: req.body.category,
                    description: req.body.description,
                    base_price: req.body.base_price,
                }
                const update_product = await empmodels.updateProduct(id, payload)
                let result = []
                if (req.files) {
                    for (let i = 0; i < req.files.length; i++) {
                        const item = req.files[i]
                        let getproduct = await empmodels.getProductImagesById(image_id[i])
                        const imgpayload = {
                            image_url: item.filename,
                            product_id: id,
                            image_type: item.mimetype,
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                        }
                        console.log('payload:', imgpayload);
                        const folder = `product_images`
                        await copyFile(req.files[i], folder)
                        const product_image = await empmodels.updateProductImage(image_id[i], imgpayload)
                        console.log('image:', product_image);
                        console.log(getproduct[0].image_url);

                        result.push(imgpayload)
                        const joindedPath = path.join(__dirname, '..', 'uploads', 'product_images', getproduct[0].image_url)
                        console.log('joined:', joindedPath);
                        await deleteFile(joindedPath)
                    }
                    return res.status(200).json({ message: 'image updated succesfully', data: { update_product, result } })
                }

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
    updateSingleImage: async (req, res) => {
        let formvalidation = Joi.object({
            imageid: Joi.number().integer().required()
        })
        let { error } = formvalidation.validate(req.params, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
        }
        let filevalidation;
        if (req.file) {
            filevalidation = fileValidate(req.file, [".jpg", ".jpeg", ".png", ".webp"], 2)
            console.log(filevalidation);
            if (!filevalidation.valid) {
                errorDetails.push({
                    field: "image",
                    message: filevalidation.message,
                });
            }
            // console.log(errorDetails);

        }
        if (errorDetails.length > 0) {
            return res.status(422).json({ message: errorDetails })
        } else {
            try {
                let { imageid } = req.params

                const product_image = await empmodels.getProductImagesById(imageid)
                if (product_image.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'image not found' }
                }
                const payload = {
                    image_url: req.file.filename,
                    image_type: req.file.mimetype,
                }
                const folder = `product_images`
                await copyFile(req.file, folder)
                await empmodels.updateProductImage(imageid, payload)
                const joindedPath = path.join(__dirname, '..', 'uploads', 'product_images', product_image[0].image_url)
                await deleteFile(joindedPath)
                return res.status(200).json({ message: 'image updated succesfully', data: { product_image, payload } })

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

    getProducts: async (req, res) => {
        try {
            let { id } = req.params
            const admin = await empmodels.getAdminData(id)
            if (admin.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'admin not found' }
            }

            let result = [];
            const products = await empmodels.getProductsByAdminId(id)
            if (products.length > 0) {
                result.push(...products);
            }
            return res.status(200).json({ message: 'products fetched succesfully', data: result })
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
    addToCart: async (req, res) => {
        let formvalidation = Joi.object({
            vendor_id: Joi.number().integer().required().min(1),
            items: Joi.array().items(Joi.object({
                product_id: Joi.number().integer().required(),
                quantity: Joi.number().integer().min(1).max(5).required()
            })).min(1)
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                let max_count = 5
                const employee = await empmodels.getEmployeeById(id)
                if (employee.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'employee not found' }
                }
                const items = req.body.items
                const vendor_id = req.body.vendor_id
                const vendor = await empmodels.getVendrosById(vendor_id)
                if (vendor.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'vendor not found' }
                }
                let group_id = Date.now()
                for (let i = 0; i < items.length; i++) {
                    const product = items[i]
                    const item = await empmodels.getProductById(product.product_id)
                    console.log('item:', item);
                    if (item.length == 0) {
                        throw { errorCode: 'VALID_ERROR', message: 'product not found' }
                    }
                    console.log(id, product.product_id, vendor_id);

                    const check = await empmodels.checkCart(id, product.product_id, vendor_id, 0)
                    console.log(check);

                    let priceAfterDiscount;
                    if (check.length > 0 && check[0].status == 1) {
                        const quantity = check[0].quantity + product.quantity
                        console.log(quantity);
                        if (quantity > max_count) {
                            throw { errorCode: 'VALID_ERROR', message: 'you can add maximum 5 quantities' }
                        }
                        const total_price = quantity * item[0].base_price
                        priceAfterDiscount = total_price - (vendor[0].discount / 100) * total_price
                        console.log(priceAfterDiscount);
                        console.log(total_price);
                        const payload = {
                            quantity, total_price, 'price_after_discount': priceAfterDiscount
                        }
                        console.log(payload);

                        const checkCondition = {
                            'employee_id': id, 'product_id': product.product_id, 'vendor_id': vendor_id, 'created_by': 0
                        }

                        const update_Cart = await empmodels.updateCart(checkCondition, payload);
                    } else {

                        if (product.quantity > max_count) {
                            throw { errorCode: 'VALID_ERROR', message: 'you can add maximum 5 quantities' }
                        }
                        const total_price = product.quantity * item[0].base_price
                        priceAfterDiscount = total_price - (vendor[0].discount / 100) * total_price
                        const data = {
                            employee_id: id,
                            admin_id: employee[0].admin_id,
                            product_id: product.product_id,
                            vendor_id,
                            quantity: product.quantity,
                            price: item[0].base_price,
                            price_after_discount: priceAfterDiscount,
                            status: 1,
                            group_id,
                            total_price,
                            date: moment().format('YYYY-MM-DD'),
                            created_at: moment().format("YYYY-MM-DD HH:mm:ss")
                        }
                        const result = await empmodels.selectProduct(data);
                    }
                }
                return res.status(200).json({ message: 'products added to cart' })
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
    verifyOrder: async (req, res) => {
        let formvalidation = Joi.object({
            status: Joi.number().integer().required(),
            quantity: Joi.number().integer().optional()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id, verify_id } = req.params
                const order = await empmodels.getOrderById(id)
                if (order.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'order not found' }
                }
                if (order[0].status != 1) {
                    throw { errorCode: 'API_ERROR', message: 'accounts team alredy reacted for this order' }
                }
                
                const vendor_id = order[0].vendor_id
                const vendor = await empmodels.getVendrosById(vendor_id)
                if (vendor.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'vendor not found' }
                }
                let verifier = await empmodels.getTeamRoleById(verify_id)
                if (Verify.length == 0 || verifier[0].role_id != 7) {
                    throw { errorCode: 'API_ERROR', message: 'invalid verifier' }
                }
                const product = await empmodels.getProductById(order[0].product_id)
                if (product.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'cannot found the product' }
                }
                const stock = product[0].stock
                
                if (stock >= order[0].quantity) {
                   const data={
                    stock:stock-order[0].quantity
                   }
                    const payload = {
                        status: req.body.status,
                        verified_by: verify_id
                    }
                    await empmodels.updateProduct(order[0].product_id,data)
                    await empmodels.updateOrderById(id, payload)
                   
                } else {
                    const total_price = req.body.quantity * product[0].base_price
                    priceAfterDiscount = total_price - (vendor[0].discount / 100) * total_price

                    const data={
                        stock:stock-req.body.quantity
                    }
                    const payload = {
                        status: req.body.status,
                        verified_by: verify_id,
                        quantity: req.body.quantity,
                        total_price,
                        price_after_discount: priceAfterDiscount
                    }
                    await empmodels.updateProduct(order[0].product_id,data)
                    await empmodels.updateOrderById(id, payload)
                }

                 return res.status(200).json({ message: 'verified succesfully' })
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
    dispatchOrder: async (req, res) => {
        let schema = Joi.object({
            status: Joi.number().integer().min(1).required()
        })
        let validation = schema.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        }
        else {
            try {
                let { id, dispatch_id } = req.params;
                console.log(id, dispatch_id);

                const order = await empmodels.getOrderById(id);


                if (order.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'order not found' }
                }
                if (order[0].status !=2) {
                    throw { errorCode: 'API_ERROR', message: 'dispatch team already reacted for this order' }
                }
                const vendor_id = order[0].vendor_id;
                const vendor = await empmodels.getVendrosById(vendor_id)

                if (vendor.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'vendor not found' }
                }
                const shipment = await empmodels.getTeamRoleById(dispatch_id);
                if (shipment.length == 0 || shipment[0].role_id != 8) {
                    throw { errorCode: 'API_ERROR', message: 'invalid verifier' }
                }
                const product = await empmodels.getProductById(order[0].product_id)
                if (product.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'cannot found the product' }
                }
                let payload = {
                    status: req.body.status,
                    shipped_by: dispatch_id
                }
                await empmodels.updateOrderById(id, payload);
                return res.status(200).json({ message: "shipped successfully" })
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
    orderDetails: async (req, res) => {
        try {
            let { group_id } = req.query
            const orders = await empmodels.getOrderByGroupId(group_id)
            if (orders.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'orders not found' }
            }
            console.log('orders:', orders);
            const vendor = await empmodels.getVendrosById(orders[0].vendor_id)
            const creditDays = vendor[0].credit_days
            if (vendor.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'vendors not found' }
            }
            let total_price = 0;
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i]
                if (order.status == 3) {
                    total_price += order.price_after_discount
                    console.log(total_price);
                }
                else {
                    throw { errorCode: 'API_ERROR', message: 'order is not eligible for delivery' }
                }
            }
            if (creditDays <= 0) {
                const payload = {
                    total_price,
                    delivery_date: moment().format('YYYY-MM-DD'),
                    group_id,
                    payment: 2,
                    payment_date: moment().format('YYYY-MM-DD')
                }
                await empmodels.insertFinalOrderDetails(payload)
                const data = {
                    status: 4
                }
                await empmodels.updateOrderByGroupId(group_id, data)
            }
            else{
            const payload = {
                total_price,
                delivery_date: moment().format('YYYY-MM-DD'),
                group_id,
                payment: 1
            }
            await empmodels.insertFinalOrderDetails(payload)
            const data = {
                status: 4
            }
            await empmodels.updateOrderByGroupId(group_id, data)
        }
            return res.status(200).json({ message: 'order delivered and you can check total price' })

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
    },
    orderPayment: async (req, res) => {
        try {
            let { vendor_id, id } = req.params
            const order = await empmodels.getOrderDetailsById(id)
            console.log(order);

            if (order.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'order not found' }
            }
            if (order[0].payment == 2) {
                throw { errorCode: 'API_ERROR', message: 'payment alredy done' }
            }
            const vendor = await empmodels.getVendrosById(id)
            if (vendor.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'vendor not found' }
            }
            let creditDays = vendor[0].credit_days
            console.log(creditDays);
            if (vendor.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'vendor not found' }
            }
            const paymentDate = moment().format('YYYY-MM-DD')
            let startDate = new Date(order[0].delivery_date);
            let endDate = new Date(paymentDate);
            const diffInMilliSeconds = endDate - startDate
            console.log(diffInMilliSeconds);
            const daysTaken = Math.floor(diffInMilliSeconds / (1000 * 60 * 60 * 24));
            console.log(daysTaken);


            const payload = {
                payement_date: paymentDate,
                payment: 2,
                days_taken: daysTaken
            }
            await empmodels.updateOrderDetails(id, payload)
            const difference = creditDays - daysTaken
            console.log(difference);
            const data = {
                credit_days: difference
            }
            await empmodels.updateVendor(vendor_id, data)
            return res.status(200).json({ message: 'payment done and details got updated' })

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
    },
    returnProduct:async(req,res)=>{
        let formvalidation=Joi.object({
           orderDetailsId:Joi.number().integer().min(1).required(),
           notes:Joi.string().min(5).max(255).required(),
           items:Joi.array().items(Joi.object({
            orderId:Joi.number().integer().min(1).required(),
            quantity:Joi.number().integer().min(1).required()
           })).required().min(1)
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
                let {vendor_id}=req.params
                const vendor=await empmodels.getVendrosById(vendor_id)
                if(vendor.length==0){
                    throw {errorCode:'VALID_ERROR',message:'vendor not found'}
                }
                const {orderDetailsId}=req.body
                const orderDetails=await empmodels.getOrderDetailsById(orderDetailsId)
                if(orderDetails.length==0){
                    throw {errorCode:'VALID_ERROR',message:'details not found'}
                }
               let items=req.body.items
               for(let i=0; i < items.length; i++){
                const item=items[i]
                const data={
                    id:item.orderId,
                    vendor_id
                }
                const order=await empmodels.getOrder(data)
                if(order.length==0 || order[0].status!=4){
                    throw {errorCode:'API_ERROR',message:'cannot get the order details'}
                }
                if(order[0].quantity<item.quantity){
                    throw {errorCode:'API_ERROR',message:'quantity cannot exceed the no of items'}
                }
                const payload={
                    order_details_id:orderDetailsId,
                    status:1,
                    notes:req.body.notes,
                    vendor_id,
                    order_id:item.orderId,
                    quantity:item.quantity,
                    created_at:moment().format("YYYY-MM-DD HH:mm:ss")
                }
                console.log(payload);
                
                await empmodels.insertReturnProduct(payload)
               }
               return res.status(200).json({message:'return request succesful'})
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
    updateReturnProduct:async(req,res)=>{
        let formvalidation=Joi.object({
            status:Joi.number().integer().min(1).required(),
            remarks:Joi.string().min(5).max(150).required()
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
                let {dispatcher_id,return_id}=req.params
                const returnProduct=await empmodels.getReturnProductById(return_id)
                if(returnProduct.length==0){
                    throw {errorCode:'VALID_ERROR',message:'return not found'}
                }

                const vendor=await empmodels.getVendrosById(returnProduct[0].vendor_id)
                if(vendor.length==0){
                    throw {errorCode:'VALID_ERROR',message:'vendor not found'}
                }
                console.log(returnProduct);
                const orderId=returnProduct[0].order_id
                const data={
                    id:orderId,
                    shipped_by:dispatcher_id
                }
                const order=await empmodels.getOrder(data)
                if(order.length==0){
                    throw {errorCode:'VALID_ERROR',message:'cannot get the order'}
                }
                const orderDetails=await empmodels.getOrderDetailsById(returnProduct[0].order_details_id)
                if(orderDetails.length==0){
                    throw {errorCode:'VALID_ERROR',message:'cannot get the order details'}
                }
                const product=await empmodels.getProductById(order[0].product_id)
                if(product.length==0){
                    throw {errorCode:'VALID_ERROR',message:'product not found'}
                }
                let stock=product[0].stock
                const status=req.body.status
                if(status==2){
                    stock+=returnProduct[0].quantity
                    console.log(stock);
                    const data={
                        stock
                    }
                    await empmodels.updateProduct(product[0].id,data)
                    //here iam d
                    const returnPrice=returnProduct[0].quantity*product[0].base_price
                    const returnPriceAfterDiscount=returnPrice-(vendor[0].discount/100)*returnPrice
                    const afterRefund=order[0].price_after_discount-returnPriceAfterDiscount
                    console.log(returnPrice,returnPriceAfterDiscount,afterRefund);
                    const data1={
                        quantity:order[0].quantity-returnProduct[0].quantity,
                        total_price:returnPrice,
                        price_after_discount:afterRefund
                    }
                    await empmodels.updateOrderById(order[0].id,data1)
                    console.log(orderDetails[0].id);
                    
                    await empmodels.updateOrderDetails(orderDetails[0].id,{total_price:orderDetails[0].total_price-returnPriceAfterDiscount})
                    const payload={
                        status:req.body.status,
                        remarks:req.body.remarks,
                        updated_at:moment().format("YYYY-MM-DD HH:mm:ss")
                    }
                    await empmodels.updateReturn(return_id,payload)
                }else{
                  const payload={
                    status:req.body.status,
                    remarks:req.body.remarks,
                      updated_at:moment().format("YYYY-MM-DD HH:mm:ss")
                  }  
                    await empmodels.updateReturn(return_id,payload)
                }
                return res.status(200).json({message:'product verified and reacted succesfully'})
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
    getOrderpagination:async(req,res)=>{
        try {
            let {vendorId}=req.params
            let offset= req.query.offset && req.query.offset != "undefined" ? parseInt(req.query.offset) : 0;
            let limit= req.query.limit && req.query.limit != "undefined" ? parseInt(req.query.limit) : 10;
            let status=req.query.status && req.query.status != "undefined" ? parseInt(req.query.status) : 0;
            const vendor=await empmodels.getVendrosById(vendorId)
            if(vendor.length==0){
                throw {errorCode:'VALID_ERROR',menubar:'vendor not found'}
            }
            let total = 0;
            let totalCount=await empmodels.orderCount(vendorId)
            console.log(totalCount);
            
            const orders=await empmodels.getOrderUsingoffset(limit,offset,vendorId,status);
            if (totalCount.length > 0) {
                total += totalCount[0].count;
            }

            return res.status(200).json({data: orders, count:total})
        } catch (error) {
             if (error.errorCode === 'VALID_ERROR') {
                return res.status(422).json({
                    message: error.message
                })
            }  else {
                return res.status(409).json({
                    error: error.message
                })
            }
        }
    },
    addToCartByVendor: async (req, res) => {
        let formvalidation = Joi.object({
            items: Joi.array().items(Joi.object({
                product_id: Joi.number().integer().required(),
                quantity: Joi.number().integer().min(1).max(5).required()
            })).min(1)
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                let max_count = 5
                const vendor = await empmodels.getVendrosById(id)
                const employee = await empmodels.getEmployeeById(vendor[0].employee_id)
                if (vendor.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'vendor not found' }
                }
                const items = req.body.items
                let group_id = Date.now()
                for (let i = 0; i < items.length; i++) {
                    const product = items[i]
                    const item = await empmodels.getProductById(product.product_id)
                    console.log('item:', item);
                    console.log(employee[0].id);
                    console.log(product.product_id, id);


                    const check = await empmodels.checkCart(employee[0].id, product.product_id, id, 1)

                    let priceAfterDiscount;
                    // console.log(check[0].created_by);

                    if (check.length > 0 || check[0].status == 1) {
                        const quantity = check[0].quantity + product.quantity
                        console.log(quantity);
                        if (quantity > max_count) {
                            throw { errorCode: 'VALID_ERROR', message: 'you can add maximum 5 quantities' }
                        }
                        const total_price = quantity * item[0].base_price
                        priceAfterDiscount = total_price - (vendor[0].discount / 100) * total_price
                        console.log(priceAfterDiscount);
                        console.log(total_price);
                        const payload = {
                            quantity, total_price, 'price_after_discount': priceAfterDiscount
                        }
                        console.log(payload);

                        const checkCondition = {
                            'employee_id': employee[0].id, 'product_id': product.product_id, 'vendor_id': id, 'created_by': 1
                        }
                        const update_Cart = await empmodels.updateCart(checkCondition, payload)

                    } else {

                        if (product.quantity > max_count) {
                            throw { errorCode: 'VALID_ERROR', message: 'you can add maximum 5 quantities' }
                        }
                        const total_price = product.quantity * item[0].base_price
                        priceAfterDiscount = total_price - (vendor[0].discount / 100) * total_price
                        const data = {
                            employee_id: employee[0].id,
                            admin_id: employee[0].admin_id,
                            product_id: product.product_id,
                            vendor_id: id,
                            quantity: product.quantity,
                            price: item[0].base_price,
                            price_after_discount: priceAfterDiscount,
                            status: 'added to cart',
                            total_price,
                            group_id,
                            date: moment().format('YYYY-MM-DD'),
                            created_by: 1,
                            created_at: moment().format("YYYY-MM-DD HH:mm:ss")
                        }
                        cart = await empmodels.selectProduct(data)
                    }
                }
                return res.status(200).json({ message: 'products added to cart' })
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
    addCategories: async (req, res) => {
        let formvalidation = Joi.object({
            title_name: Joi.string().min(1).max(255).required(),
            category: Joi.string().min(1).max(100).valid('medicine', 'mineral').required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                const management = await empmodels.getMgmtDetails(id)
                if (management.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'managment not found' }
                }
                const data = {
                    title_name: req.body.title_name,
                    category: req.body.category,
                    managment_id: id
                }
                const category = await empmodels.addCategoryTypes(data)
                return res.status(200).json({ message: 'category added succesfully', data: category })
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
    getCategories: async (req, res) => {
        try {
            let result = []
            let { id } = req.params
            const management = await empmodels.getMgmtDetails(id)
            if (management.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'management not found' }
            } else {
                const categories = await empmodels.getCategoriesByMgmtId(id)
                result.push(...categories)
            }
            return res.status(200).json({ message: 'categories get succesfully', data: result })
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
    addCompanyDetails: async (req, res) => {
        let formvalidation = Joi.object({
            name: Joi.string().min(1).max(255).required(),
            team_name: Joi.string().min(1).max(100).valid('Brand owner', 'manufacturer').required(),
            company_name: Joi.string().min(1).max(100).required(),
            company_size: Joi.string().min(1).max(250).valid('small', 'medium', 'large').required(),
            address: Joi.string().min(1).max(150).required(),
            gst: Joi.string().min(1).max(100).alphanum().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required(),
            shipping_address: Joi.string().min(1).max(150).required(),
            product_category: Joi.number().integer().required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                const managment = await empmodels.getMgmtDetails(id);
                if (managment.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'cannot found management' }
                }
                const checkGST = await empmodels.getCompanyDetails(req.body.gst)
                console.log(checkGST);

                if (checkGST.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'gst number alredy exist' }
                }

                const data = {
                    name: req.body.name,
                    team_name: req.body.team_name,
                    company_name: req.body.company_name,
                    company_size: req.body.company_size,
                    address: req.body.address,
                    gst: req.body.gst,
                    shipping_address: req.body.shipping_address,
                    product_category: req.body.product_category,
                    managment_id: id
                }

                const company = await empmodels.insertCompDetails(data)
                return res.status(200).json({ message: 'company added succesfully' })
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
    addMgmtProduct: async (req, res) => {
        let formvalidation = Joi.object({
            productName: Joi.string().min(1).max(255).required(),
            type: Joi.number().integer().min(1).required(),
            productDescription: Joi.string().min(1).max(150).required(),
            price: Joi.number().min(1).required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
        }
        if (!req.files || req.files.length == 0) {
            errorDetails.push({
                field: 'image',
                message: 'Atlest one image is required'
            })
        } else {
            let filevalidation;
            let totalSize = 0;
            for (let i = 0; i < req.files.length; i++) {
                filevalidation = fileValidate(req.files[i], [".jpg", ".jpeg", ".png", ".webp"], 2)
                console.log(filevalidation);
                totalSize += req.files[i].size
                if (!filevalidation.valid) {
                    errorDetails.push({
                        field: 'image',
                        message: filevalidation.message
                    })
                }
            }
            if (totalSize > 5 * 1024 * 1024) {
                errorDetails.push({
                    field: "product_image",
                    message: "Images size should not exceed 5MB"
                });
            }

        }
        if (errorDetails.length > 0) {
            return res.status(422).json({ message: errorDetails })
        }
        else {
            try {
                let { id } = req.params
                const management = await empmodels.getMgmtDetails(id)
                if (management.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'management not found' }
                }
                const payload = {
                    name: req.body.productName,
                    category: req.body.type,
                    description: req.body.productDescription,
                    mgmt_id: id,
                    base_price: req.body.price,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }
                let result = []
                const product = await empmodels.addproduct(payload)
                if (req.files) {
                    for (let i = 0; i < req.files.length; i++) {
                        const item = req.files[i]
                        const payload = {
                            image_url: item.filename,
                            image_type: item.mimetype,
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            product_id: product
                        }
                        console.log('payload:', payload);
                        const folder = `mgmt_product_images`
                        await copyFile(req.files[i], folder)
                        const product_image = await empmodels.addProductImage(payload)
                        console.log('image:', product_image);
                        result.push(payload)
                    }
                }
                return res.status(200).json({ message: 'product added succesfully', data: { product, result } })
            } catch (error) {
                if (error.errorCode == 'VALID_ERROR') {
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
    getMgmtProduct: async (req, res) => {
        try {
            let { id } = req.params
            const management = await empmodels.getMgmtDetails(id)
            if (management.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'management not found' }
            }
            const products = await empmodels.getProductByMgmtId(id)
            return res.status(200).json({ message: 'succesfully fetched the product details', data: products })
        } catch (error) {
            if (error.errorCode == 'VALID_ERROR') {
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
    packageCreation: async (req, res) => {
        let formvalidation = Joi.object({
            categoryType: Joi.string().min(1).max(150).valid('Brand owner', 'Manufacturer').required(),
            categorySize: Joi.string().min(1).max(150).valid('small', 'medium', 'large'),
            firstTimePackage: Joi.number().min(1).required(),
            monthlyBasicPackage: Joi.number().min(1).required(),
            monthlyStandardPackage: Joi.number().min(1).required(),
            monthlyPremiumPackage: Joi.number().min(1).required(),
            yearlyBasicPackage: Joi.number().min(1).required(),
            yearlyStandardPackage: Joi.number().min(1).required(),
            yearlyPremiumPackage: Joi.number().min(1).required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                const management = await empmodels.getMgmtDetails(id)
                if (management.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'managment not found' }
                }
                const payload = {
                    category: req.body.categoryType,
                    size: req.body.categorySize,
                    setup_charges: req.body.firstTimePackage,
                    monthly_basic: req.body.monthlyBasicPackage,
                    monthly_standard: req.body.monthlyStandardPackage,
                    monthly_premium: req.body.monthlyPremiumPackage,
                    yearly_basic: req.body.yearlyBasicPackage,
                    yearly_standard: req.body.yearlyStandardPackage,
                    yearly_premium: req.body.yearlyPremiumPackage,
                    mgmt_id: id
                }
                console.log(payload);

                const package = await empmodels.addPackage(payload)
                return res.status(200).json({ message: 'package added succesfully' })
            } catch (error) {
                if (error.errorCode == 'VALID_ERROR') {
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
    getPackageForCompany: async (req, res) => {
        try {
            let { id } = req.params
            const company = await empmodels.getCompanyById(id)
            if (company.length == 0) {
                throw { errorCode: 'VALID_ERROR', message: 'company not found' }
            }
            const name = company[0].team_name
            const size = company[0].company_size
            const package = await empmodels.getPackage(name, size)
            return res.status(200).json({ message: 'package details fetched succesfully', data: package })

        } catch (error) {
            if (error.errorCode == 'VALID_ERROR') {
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
    createRoleTypes: async (req, res) => {
        let formvalidation = Joi.object({
            employeeName: Joi.string().min(1).max(150).required(),
            employeeContact: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
            employeeEmail: Joi.string().email().min(5).max(150).required(),
            employeeAadhar: Joi.string().length(12).pattern(/^[2-9]{1}[0-9]{11}$/).required(),
            panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(),
            location: Joi.string().min(1).max(150).required(),
            username: Joi.string().alphanum().min(3).max(30).required(),
            password: Joi.string().pattern(/[a-z]+/, { name: 'lowercase' }) // At least one lowercase letter
                .pattern(/[A-Z]+/, { name: 'uppercase' }) // At least one uppercase letter
                .pattern(/[0-9]+/, { name: 'number' }) // At least one number
                .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/, { name: 'special character' }),// At least one special character,

            role_id: Joi.number().integer().min(1).required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {

                let { id } = req.params
                const admin = await empmodels.getAdminData(id)
                if (admin.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'admin not found' }
                }
                let errors = [];
                const checkEmail = await empmodels.checkEmpEmail(req.body.employeeEmail)
                if (checkEmail.length > 0) {
                    errors.push('email alredy exist')
                }
                const checkUser = await empmodels.checkEmpUsername(req.body.username)
                console.log(checkUser);

                if (checkUser.length > 0) {
                    errors.push('username alredy exist')
                }
                const checkContact = await empmodels.checkEmpContact(req.body.employeeContact)
                if (checkContact.length > 0) {
                    errors.push('contact alredy exist')
                }
                if (errors.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: errors }
                }
                const bcryptPassword = await bcrypt.hash(req.body.password, 10)
                let create = admin[0].team_name == 'Brand owner' ? 1 : 2

                let payload = {
                    name: req.body.employeeName,
                    contact: req.body.employeeContact,
                    email: req.body.employeeEmail,
                    aadhar: req.body.employeeAadhar,
                    pan: req.body.panNumber,
                    address: req.body.location,
                    username: req.body.username,
                    password: bcryptPassword,
                    created_by: create,
                    role_id: req.body.role_id,
                    parent_id: id
                }
                const manufacture = await empmodels.addTeamEmployee(payload)
                return res.status(200).json({ message: 'employee added for the team succesfully' })
            } catch (error) {
                if (error.errorCode == 'VALID_ERROR') {
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
    createProduction: async (req, res) => {
        let formvalidation = Joi.object({
            employeeName: Joi.string().min(1).max(150).required(),
            employeeContact: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
            employeeEmail: Joi.string().email().min(5).max(150).required(),
            employeeAadhar: Joi.string().length(12).pattern(/^[2-9]{1}[0-9]{11}$/).required(),
            panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(),
            location: Joi.string().min(1).max(150).required(),
            username: Joi.string().alphanum().min(3).max(30).required(),
            password: Joi.string().pattern(/[a-z]+/, { name: 'lowercase' }) // At least one lowercase letter
                .pattern(/[A-Z]+/, { name: 'uppercase' }) // At least one uppercase letter
                .pattern(/[0-9]+/, { name: 'number' }) // At least one number
                .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/, { name: 'special character' }),// At least one special character,

            role_id: Joi.number().integer().min(1).required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                const emp_role = await empmodels.getTeamRoleById(id)
                if (emp_role.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'manufacture not found' }
                }
                console.log(emp_role[0].id);

                const team_type = await empmodels.getRoleType(emp_role[0].id)
                if (team_type[0].id != 1) {
                    throw { errorCode: 'VALID_ERROR', message: 'only CFO in manufactures can add employee can add employee' }
                }
                let errors = [];
                const checkEmail = await empmodels.checkEmpEmail(req.body.employeeEmail)
                if (checkEmail.length > 0) {
                    errors.push('email alredy exist')
                }
                const checkUser = await empmodels.checkEmpUsername(req.body.username)
                console.log(checkUser);

                if (checkUser.length > 0) {
                    errors.push('username alredy exist')
                }
                const checkContact = await empmodels.checkEmpContact(req.body.employeeContact)
                console.log(checkContact);

                if (checkContact.length > 0) {
                    errors.push('contact alredy exist')
                }
                if (errors.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: errors }
                }

                const bcryptPassword = await bcrypt.hash(req.body.password, 10)
                const payload = {
                    name: req.body.employeeName,
                    contact: req.body.employeeContact,
                    email: req.body.employeeEmail,
                    aadhar: req.body.employeeAadhar,
                    pan: req.body.panNumber,
                    address: req.body.location,
                    username: req.body.username,
                    password: bcryptPassword,
                    created_by: 2,
                    role_id: req.body.role_id,
                    manufacture_id: id
                }
                const production = await empmodels.addTeamEmployee(payload)
                return res.status(200).json({ message: 'production employee added succesfully' })

            } catch (error) {
                if (error.errorCode == 'VALID_ERROR') {
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
    createBrandOwnerByManufactur: async (req, res) => {
        let formvalidation = Joi.object({
            brandOwnerName: Joi.string().min(1).max(255).required(),
            company_name: Joi.string().min(1).max(100).required(),
            company_size: Joi.string().min(1).max(250).valid('small', 'medium', 'large').required(),
            address: Joi.string().min(1).max(150).required(),
            gst: Joi.string().min(1).max(100).alphanum().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required(),
            shipping_address: Joi.string().min(1).max(150).required(),
            product_category: Joi.number().integer().required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { id } = req.params
                let manufacture = await empmodels.getManufacture(id)
                console.log(typeof manufacture);

                if (manufacture.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'manufacture not found' }
                }
                const checkGST = await empmodels.getCompanyDetails(req.body.gst)
                console.log(checkGST);

                if (checkGST.length > 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'gst number alredy exist' }
                }
                const payload = {
                    name: req.body.brandOwnerName,
                    team_name: 'Brand owner',
                    company_name: req.body.company_name,
                    company_size: req.body.company_size,
                    address: req.body.address,
                    gst: req.body.gst,
                    shipping_address: req.body.shipping_address,
                    product_category: req.body.product_category,
                    manufactur_id: id
                }
                await empmodels.insertCompDetails(payload)
                return res.status(200).json({ message: 'Brand owner added succesfully' })
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
    createManufactureProduct: async (req, res) => {
        let formvalidation = Joi.object({
            productName: Joi.string().min(1).max(255).required(),
            type: Joi.number().integer().min(1).required(),
            productDescription: Joi.string().min(1).max(150).required(),
            price: Joi.number().min(1).required(),
            applicableTo: Joi.number().integer().valid(1, 2).required()
        })
        let validation = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (validation.error) {
            errorDetails = validation.error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
        }
        if (!req.files || req.files.length == 0) {
            errorDetails.push({
                field: 'image',
                message: 'Atlest one image is required'
            })
        } else {
            let filevalidation;
            let totalSize = 0;
            for (let i = 0; i < req.files.length; i++) {
                filevalidation = fileValidate(req.files[i], [".jpg", ".jpeg", ".png", ".webp"], 2)
                console.log(filevalidation);
                totalSize += req.files[i].size
                if (!filevalidation.valid) {
                    errorDetails.push({
                        field: 'image',
                        message: filevalidation.message
                    })
                }
            }
            if (totalSize > 5 * 1024 * 1024) {
                errorDetails.push({
                    field: "product_image",
                    message: "Images size should not exceed 5MB"
                });
            }

        }
        if (errorDetails.length > 0) {
            return res.status(422).json({ message: errorDetails })
        }
        else {
            try {
                let { id } = req.params
                let manufacture = await empmodels.getManufacture(id)
                console.log(typeof manufacture);

                if (manufacture.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'manufacture not found' }
                }
                const payload = {
                    name: req.body.productName,
                    category: req.body.type,
                    description: req.body.productDescription,
                    manufacture_id: id,
                    created_by: 2,
                    base_price: req.body.price,
                    applicable_to: req.body.applicableTo,
                    created_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }
                let result = []
                const product = await empmodels.addproduct(payload)
                if (req.files) {
                    for (let i = 0; i < req.files.length; i++) {
                        const item = req.files[i]
                        const payload = {
                            image_url: item.filename,
                            image_type: item.mimetype,
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            product_id: product
                        }
                        console.log('payload:', payload);
                        const folder = `manufacture_product_images`
                        await copyFile(req.files[i], folder)
                        const product_image = await empmodels.addProductImage(payload)
                        console.log('image:', product_image);
                        result.push(payload)
                    }
                    return res.status(200).json({ message: 'product added succesfully' })
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
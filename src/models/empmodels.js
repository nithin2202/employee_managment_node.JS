let db = require('../../config/mysqlDB');



let empmodels = {
    getAdminData: async (Id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('admin_details')
            result.select('id')
            result.select('gst')
            result.select('team_name')
            result.select('managment_id')
            result.where('id', Id)
            return await result
        }
        catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }

    },
    addemp: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_details')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    getAllEmps: async (id, trx = null) => {
        let knex = trx != null ? trx : db
        try {
            let result = knex('emp_details')
            result.where('admin_id', id)
            result.select('name')
            result.select('contact')
            result.select('email')
            result.select('address')
            result.select('role')
            result.select('experience')
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    login: async (username, trx = null) => {
        let knex = trx != null ? trx : db
        try {
            let result = knex('emp_details');

            result.select('username');
            result.select('password');

            result.where('username', username);

            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    checkEmail: async (email, trx = null) => {
        let knex = trx != null ? trx : db
        try {
            let result = knex('emp_details')
            result.select('email')
            result.select('id')
            result.where('email', email)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    checkUsername: async (name, trx = null) => {
        let knex = trx != null ? trx : db
        try {
            let result = knex('emp_details')
            result.select('name')
            result.select('id')
            result.select('password')
            result.select('security_attempts')
            result.select('last_attempt')
            result.where('username', name)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    checkContact: async (contact, trx = null) => {
        let knex = trx != null ? trx : db
        try {
            let result = knex('emp_details')
            result.select('id')
            result.select('name')
            result.select('contact')
            result.where('contact', contact)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    checkPan: async (pan, trx = null) => {
        let knex = trx != null ? trx : db
        try {
            let result = knex('emp_details')
            result.select('id')
            result.select('name')
            result.select('contact')
            result.where('pan_number', pan)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getQuestions: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('security_questions')
            result.select('id')
            result.select('question')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getAnswers: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('security_answers')
            result.select('question_id')
            result.select('answer')
            result.where('question_id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updatePassword: async (username, password, date, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_details')
            result.where('username', username)
            result.update({ 'password': password, 'updated_date': date })
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    resetSecurityQuestions: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        console.log('hii');

        try {
            let result = knex('emp_details')
            result.where('id', id)
            result.update({ security_attempts: 0, last_attempt: null })
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    increaseAttempt: async (id, attempts, last, trx = null) => {


        let knex = trx != null ? trx : db;
        try {
            console.log('hello');

            let result = knex('emp_details')
            result.where('id', id)
            result.update({ security_attempts: attempts, last_attempt: last })
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    createQuestion: async (que, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('security_questions')
            result.insert({ question: que })
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateQuestion: async (que, id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('security_questions')
            result.where('id', id)
            result.update({ question: que })
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getQuestionById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('security_questions')
            result.select('id', 'question')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    getAllQuestions: async (trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('security_questions')
            result.select('id', 'question')
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    deleteQuestion: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('security_questions')
            result.where('id', id)
            result.del()
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getEmployeeById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_details')
            result.select('id', 'name', 'email', 'contact', 'address', 'role', 'designation', 'sales_target', 'comm', 'TA', 'DA', 'image_url', 'total_leaves', 'leaves_taken', 'remaining_leaves', 'mgr_id', 'admin_id')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateEmployee: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_details')
            result.where('id', id)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    uploadImage: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_details')
            result.where('id', id)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getTodayAttendence: async (id, today, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_attendance')
            result.select('id')
            result.select('login_time')
            result.select('logout_time')
            result.where('employee_id', id)
            result.andWhere('attendance_date', today)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    addAttendence: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_attendance')
            result.where('employee_id', id)
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateAttendence: async (id, today, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_attendance')
            result.where('employee_id', id)
            result.andWhere('attendance_date', today)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    leave: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_leaves')
            result.where('employee_id', id)
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    getLeaveById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_leaves')
            result.where('id', id)
            result.select('employee_id')
            result.select('start_date')
            result.select('end_date')
            result.select('total_days')
            result.select('reason')
            result.select('status')
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    leaveStatus: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_leaves')
            result.where('id', id)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    updateLeaves: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_details')
            result.where('id', id)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    checkOverlap: async (id, start_date, end_date, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_leaves')
            result.select('id')
            result.select('total_days')
            result.where('employee_id', id)
            result.whereIn('status', ['Approved', 'pending'])
            result.where('end_date', '>=', start_date)
            result.andWhere('start_date', '<=', end_date)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    verifyVendorEmail: async (email, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('vendors')
            result.select('name')
            result.where('email', email)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    verifyVendorContact: async (contact, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('vendors')
            result.select('name')
            result.where('contact', contact)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    insertVendor: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('vendors')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateVendor: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('vendors')
            result.where('id', id)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getVendrosByEmployeeId: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('vendors')
            result.select('id', 'name', 'org_name', 'location', 'email', 'contact')
            result.where('employee_id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getVendrosById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('vendors')
            result.select('id', 'name', 'org_name', 'location', 'email', 'employee_id', 'contact', 'credit_days', 'discount', 'credit_days')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getAllVendors: async (trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('vendors')
            result.select('id', 'name', 'org_name', 'location', 'email', 'contact')
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getRole: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('roles')
            result.where
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getAllManagers: async (admin_id, id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_details')
            result.where('role_id', '>', id)
            result.andWhere('admin_id', admin_id)
            result.select('name', 'contact', 'email', 'role_id', 'role', 'designation', 'id')
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateMgr: async (id, admin_id, role_id, mgr, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_details')
            result.where({ 'admin_id': admin_id, 'role_id': role_id, 'id': id })
            result.update({ mgr_id: mgr })
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getEmpByAdminId: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('emp_details')
            result.select('id')
            result.select('name')
            result.select('contact')
            result.select('email')
            result.select('address')
            result.select('designation')
            result.where('admin_id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },

    getVendorsByAdminId: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('vendors')
            result.select('org_name')
            result.select('name')
            result.select('email')
            result.select('contact')
            result.select('location')
            result.where('admin_id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    addproduct: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('products')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateProduct: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('products')
            result.update(data)
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    addProductImage: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('product_images')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateProductImage: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('product_images')
            result.where('id', id)
            result.update(data)

            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    selectProduct: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('orders')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getProductImagesById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('product_images')
            result.select('id')
            result.select('image_url')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getProductById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {


            let result = knex('products')
            result.select('name')
            result.select('category')
            result.select('stock')
            result.select('base_price')
            result.select('id')
            result.where('id', id)


            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getProductsByAdminId: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('products')
            result.select('name')
            result.select('category')
            result.select('base_price')
            result.where('admin_id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    checkCart: async (id, pid, vid, created_by, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('orders')
            result.select('quantity', 'created_by')
            result.where({ 'employee_id': id, 'product_id': pid, 'vendor_id': vid, 'created_by': created_by })
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    updateCart: async (check, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('orders')
            //   result.where({'employee_id':id,'product_id':pid,'vendor_id':vid,'created_by':created_by})
            result.where(check)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getOrderById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('orders')
            result.select('id')
            result.select('quantity')
            result.select('status')
            result.select('product_id')
            result.select('vendor_id')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    orderCount: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('orders')
            result.count("* as count")
            result.where('vendor_id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getOrderUsingoffset: async (limit, offset, id, status, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('orders')
            result.select('id')
            result.select('quantity')
            result.select('status')
            result.select('product_id')
            result.select('vendor_id')
            result.select('shipped_by')
            result.select('price_after_discount')
            result.where('vendor_id', id)
            if (limit > 0 && offset > 0 && status > 0) {
                result.andWhere('status', status)
                result.limit(limit)
                result.offset(offset)
            }
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getOrder: async (check, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('orders')
            result.select('id')
            result.select('quantity')
            result.select('status')
            result.select('product_id')
            result.select('vendor_id')
            result.select('shipped_by')
            result.select('price_after_discount')
            result.where(check)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getOrderByGroupId: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('orders')
            result.select('id')
            result.select('quantity')
            result.select('status')
            result.select('product_id')
            result.select('price_after_discount')
            result.select('vendor_id')
            result.where('group_id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    insertFinalOrderDetails: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('order_details')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateOrderDetails: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('order_details')
            result.where('id', id)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateReturn: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('returns')
            result.where('id', id)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateOrderById: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('orders')
            result.where('id', id)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateOrderByGroupId: async (id, data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('orders')
            result.where('group_id', id)
            result.update(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getOrderDetailsById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('order_details')
            result.select('total_price')
            result.select('delivery_date')
            result.select('group_id')
            result.select('payment')
            result.select('id')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    insertReturnProduct: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('returns')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getReturnProductById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('returns')
            result.select('id')
            result.select('order_id')
            result.select('vendor_id')
            result.select('order_details_id')
            result.select('quantity')
            result.select('status')
            result.select('notes')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },

    getMgmtDetails: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('managment')
            result.select('name')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },

    addCategoryTypes: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('categories')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getCategoriesByMgmtId: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('categories')
            result.select('title_name')
            result.select('category')
            result.where('managment_id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    insertCompDetails: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('admin_details')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getCompanyDetails: async (gst, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('admin_details')
            result.select('id')
            result.where('gst', gst)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getCompanyById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('admin_details')
            result.select('team_name')
            result.select('company_size')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getProductByMgmtId: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('products')
            result.select('name')
            result.select('category')
            result.select('description')
            result.select('base_price')
            result.where('mgmt_id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    addPackage: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('packages')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getPackage: async (name, size, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('packages')
            result.select('category')
            result.select('size')
            result.select('setup_charges')
            result.select('monthly_basic')
            result.select('monthly_standard')
            result.select('monthly_premium')
            result.select('yearly_basic')
            result.select('yearly_Standard')
            result.select('yearly_premium')
            result.where('category', name)
            result.andWhere('size', size)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },

    addTeamEmployee: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('team_roles')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getTeamRoleById: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('team_roles')
            result.select('role_id')
            result.select('id')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    getRoleType: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('team_type')
            result.select('role')
            result.select('id')
            result.where('id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    checkEmpEmail: async (email, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('team_roles')
            result.select('id')
            result.where('email', email)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    checkEmpUsername: async (username, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('team_roles')
            result.select('id')
            result.where('username', username)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    checkEmpContact: async (contact, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('team_roles')
            result.select('id')
            result.where('contact', contact)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getManufacture: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('admin_details')
            result.select('id')
            result.where('id', id)
            result.andWhere('team_name', 'manufacturer')
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    insertReview:async(data,trx=null)=>{
         let knex = trx != null ? trx : db;
         try {
            let result=knex('reviews')
            result.insert(data)
            return await result
         } catch (error) {
             throw { errorCode: 'DB_Error', message: 'error occured while executing' }
         }
    },
    getReviewById:async(id,trx=null)=>{
        let knex = trx != null ? trx : db;
        try {
            let result=knex('reviews')
            result.select('id')
            result.select('product_id')
            result.select('vendor_id')
            result.select('rating')
            result.select('comment')
            result.where('id',id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    updateReview:async(id,data,trx=null)=>{
         let knex = trx != null ? trx : db;
         try {
            let result=knex('reviews')
            result.where('id',id)
            result.update(data)
            return await result
         } catch (error) {
            throw { errorCode: 'DB_Error', message: 'error occured while executing' }
         }
    },
    deleteReview:async(id,trx=null)=>{
        let knex = trx != null ? trx : db;
        try {
            let result=knex('reviews')
            result.where('id',id)
            result.del()
            return await result
        } catch (error) {
             throw { errorCode: 'DB_Error', message: 'error occured while executing' }
        }
    },
    getReviewByProductId:async(id,trx=null)=>{
         let knex = trx != null ? trx : db;
         try {
            let result=knex('reviews')
            result.select('rating')
            result.select('comment')
            result.where('product_id',id)
            return await result
         } catch (error) {
             throw { errorCode: 'DB_Error', message: 'error occured while executing' }
         }
    }


}
module.exports = empmodels
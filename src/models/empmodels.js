let db=require('../../config/mysqlDB')

let empmodels={
    getAdminData:async(Id,trx=null)=>{
        let knex=trx!=null?trx:db;
        try{
            let result=knex('admin_details')
            result.select('id')
            return await result
        }
        catch(error){
            throw {errorCode:'DB_Error',message:'error occured while executing'}
        }

    },
    addemp:async(data,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('emp_details')
            result.insert(data)
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:'error occured while executing'}
        }
    },
    getAllEmps:async(id,trx=null)=>{
        let knex=trx!=null?trx:db
        try {
            let result=knex('emp_details')
            result.where('admin_id',id)
            result.select('name')
            result.select('contact')
            result.select('email')
            result.select('address')
            result.select('role')
            result.select('experience')
            return await result
        } catch (error) {
              throw {errorCode:'DB_Error',message:'error occured while executing'}
        }
    },
    login:async(username,trx=null)=>{
        let knex=trx!=null?trx:db
        try {
            let result=knex('emp_details');

            result.select('username');
            result.select('password');

            result.where('username',username);
            
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:'error occured while executing'}
        }
    },
    checkEmail:async(email,trx=null)=>{
          let knex=trx!=null?trx:db
          try {
            let result=knex('emp_details')
            result.select('email')
            result.select('id')
            result.where('email',email)
            return await result
          } catch (error) {
            throw {errorCode:'DB_Error',message:'error occured while executing'}
          }
    },
    checkUsername:async(name,trx=null)=>{
          let knex=trx!=null?trx:db
          try {
            let result=knex('emp_details')
            result.select('name')
            result.select('id')
            result.select('password')
            result.select('security_attempts')
            result.select('last_attempt')
            result.where('username',name)
            return await result
          } catch (error) {
            throw {errorCode:'DB_Error',message:'error occured while executing'}
          }
    },
    checkContact:async(contact,trx=null)=>{
          let knex=trx!=null?trx:db
          try {
            let result=knex('emp_details')
            result.select('id')
            result.select('name')
            result.select('contact')
            result.where('contact',contact)
            return await result
          } catch (error) {
            throw {errorCode:'DB_Error',message:'error occured while executing'}
          }
    },
    getQuestions:async(id,trx=null)=>{
         let knex=trx!=null?trx:db;
         try {
            let result=knex('security_questions')
            result.select('id')
            result.select('question')
            result.where('id',id)
            return await result
         } catch (error) {
            throw {errorCode:'DB_Error',message:'error occured while executing'}
         }
    },
    getAnswers:async(id,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('security_answers')
            result.select('question_id')
            result.select('answer')
            result.where('question_id',id)
            return await result
        } catch (error) {
             throw {errorCode:'DB_Error',message:'error occured while executing'}
        }
    },
    updatePassword:async(username,password,date,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('emp_details')
            result.where('username',username)
            result.update({'password':password,'updated_date':date})
            return await result
        } catch (error) {
             throw {errorCode:'DB_Error',message:'error occured while executing'}
        }
    },
    resetSecurityQuestions:async(id,trx=null)=>{
         let knex=trx!=null?trx:db;
         console.log('hii');
         
         try {
            let result=knex('emp_details')
            result.where('id',id)
            result.update({security_attempts:0,last_attempt:null})
            return await result
         } catch (error) {
             throw {errorCode:'DB_Error',message:error.message}
         }
    },
    increaseAttempt:async(id,attempts,last,trx=null)=>{
        
        
        let knex=trx!=null?trx:db;
        try {
            console.log('hello');
            
            let result=knex('emp_details')
            result.where('id',id)
            result.update({security_attempts:attempts,last_attempt:last})
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
        }
    },
    createQuestion:async(que,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('security_questions')
            result.insert({question:que})
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
        }
    },
    updateQuestion:async(que,id,trx=null)=>{
           let knex=trx!=null?trx:db;
        try {
            let result=knex('security_questions')
            result.where('id',id)
            result.update({question:que})
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
        }
    },
    getQuestionById:async(id,trx=null)=>{
          let knex=trx!=null?trx:db;
          try {
             let result=knex('security_questions')
             result.select('id','question')
             result.where('id',id)
             return await result
          } catch (error) {
             throw {errorCode:'DB_Error',message:error.message}
          }
    },
    getAllQuestions:async(trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('security_questions')
            result.select('id','question')
            return await result
        } catch (error) {
             throw {errorCode:'DB_Error',message:error.message}
        }
    },
    deleteQuestion:async(id,trx=null)=>{
         let knex=trx!=null?trx:db;
         try {
            let result=knex('security_questions')
            result.where('id',id)
            result.del()
            return await result
         } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
         }
    },
    getEmployeeById:async(id,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('emp_details')
            result.select('id','name','email','contact','address','role','designation','sales_target','comm','TA','DA','image_url','total_leaves','leaves_taken','remaining_leaves')
            result.where('id',id)
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
        }
    },
    updateEmployee:async(id,data,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('emp_details')
            result.where('id',id)
            result.update(data)
            return await result
        } catch (error) {
             throw {errorCode:'DB_Error',message:error.message}
        }
    },
    uploadImage:async(id,data,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('emp_details')
            result.where('id',id)
            result.update(data)
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
        }
    },
    getTodayAttendence:async(id,today,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('emp_attendance')
            result.select('id')
            result.select('login_time')
            result.select('logout_time')
            result.where('employee_id',id)
            result.andWhere('attendance_date',today)
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
        }
    },
    addAttendence:async(id,data,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('emp_attendance')
            result.where('employee_id',id)
            result.insert(data)
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
        }
    },
    updateAttendence:async(id,today,data,trx=null)=>{
         let knex=trx!=null?trx:db;
         try {
            let result=knex('emp_attendance')
            result.where('employee_id',id)
            result.andWhere('attendance_date',today)
            result.update(data)
            return await result
         } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
         }
    },
    leave:async(id,data,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('emp_leaves')
            result.where('employee_id',id)
            result.insert(data)
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
        }
    },
    getLeaveById:async(id,trx=null)=>{
         let knex=trx!=null?trx:db;
         try {
            let result=knex('emp_leaves')
            result.where('id',id)
            result.select('employee_id')
            result.select('start_date')
            result.select('end_date')
            result.select('total_days')
            result.select('reason')
             result.select('status')
            return await result
         } catch (error) {
             throw {errorCode:'DB_Error',message:error.message}
         }
    },
    leaveStatus:async(id,data,trx=null)=>{
         let knex=trx!=null?trx:db;
         try {
            let result=knex('emp_leaves')
            result.where('id',id)
            result.update(data)
            return await result
         } catch (error) {
             throw {errorCode:'DB_Error',message:error.message}
         }
    },
    updateLeaves:async(id,data,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('emp_details')
            result.where('id',id)
            result.update(data)
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
        }
    },
    checkOverlap:async(id,start_date,end_date,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('emp_leaves')
            result.select('id')
            result.select('total_days')
            result.where('employee_id',id)
            result.whereIn('status',['Approved','pending'])
            result.where('end_date','>=',start_date)
            result.andWhere('start_date','<=',end_date)
            return await result
        } catch (error) {
            throw {errorCode:'DB_Error',message:error.message}
        }
    }
    
}
module.exports=empmodels
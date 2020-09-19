const express = require('express');
const router = express.Router({mergeParams : true});
var constants = require('../constants');
const server_url = "http://"+constants.APP_URL+":"+ constants.APP_URL_PORT +"/api";
const front_url = "http://"+constants.WEB_URL+":"+constants.WEB_URL_PORT;

var nodemailer = require('nodemailer');
var model = require('../model');
var param = new Object();
var transprter = nodemailer.createTransport({
    host : 'smtp.outlook.office365.com',
    port : 587,
    secure : false,
    auth : {
        user : '',
        pass : ''
    },
    tls : {
        ciphers : ''
    },
    requireTLS : true
})

router.use((req, res, next)=>{
    param = new Object();

    Object.keys(req.body).map((val)=>{
        if(req.body[val].length != undefined){
            req.body[val] = req.body[val].replace(/(\'?\')/gm, '\'\'');
        }
    })

    next();
})

router.post("/api/login_check", function(req, res, next){
    if(req.session.user_info){
       res.send("true")
    }else{
        res.send("false")
    }
});

router.post("/api/logout", function(req, res, next){
    req.session.destroy(function(){
        req.session;
    })
    
    res.send("true")
});

router.post("/api/get_admin_message", async function(req, res, next){
    var admin_comment;

    if(req.session.user_info){
        res.send("true")
     }

    await model.open_conn();
    admin_comment = await model.get_admin_comment();
    await model.close_conn();

    res.send(admin_comment)
})

router.post("/api/login", async function(req, res, next){
    var user_info;

    try{
        await model.open_conn();
        user_info = await model.get_login_info(req.body.id);
        await model.close_conn();
    
        if(user_info && req.body.id === user_info.ID && req.body.password === user_info.PASSWORD){
    
            req.session.user_info = user_info;
            req.session.user_info.PASSWORD = undefined;
    
            res.send("true")        
        }else{
            res.send("false")        
        }
    }catch(e){
        res.send("false")
    }
});

router.post("/api/send_mail", async function(req, res, next){
    var user_info, mail_pswd;

    try
    {
        await model.open_conn();
        user_info = await model.get_login_info(req.body.id);

        if(user_info){
            mail_pswd = req.sessionID.substring(0,4) + (Math.floor(Math.random() * (9999 - 0)) + 0);
            req.session.mail_pswd = mail_pswd;
            req.session.reset_pswd_id = user_info.ID;

            var mail_result = await transprter.sendMail({
                from : '',
                to : user_info.MAIL,
                subject : '人事評価システムパスワードリセット',
                text : user_info.NAME+'様\nお疲れ様です。\n\n次のURLに接続してパスワード変更を進めてください。\n\n'+front_url+"/reset_pswd/"+mail_pswd
            })
        }else{
            param.err = "このメールのユーザーがいません。";
        }    
        
        await model.close_conn();    
    }catch(err){
        await model.open_conn();
        param.err = err.message;
    }

    res.send(param);
});

router.post("/api/get_reset_id", async function(req, res, next){

    try{
        if(!req.session.mail_pswd || req.session.mail_pswd != req.body.mail_info){
            param.err = "間違った経路です。";
        }else{
            param.user_id = req.session.reset_pswd_id;
        }
    }catch(err){
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/reset_pswd", async function(req, res, next){
    var m_result;

    try{
        await model.open_conn();
        m_result = await model.reset_pswd(req.body.id, req.body.pswd);

        req.session.destroy(function(){
            req.session.mail_pswd;
        })

        await model.close_conn();
    }catch(err){
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/get_early_list", async function(req, res, next){
    var query;
    var s_u_info = req.session.user_info;

    

    try{
        await model.open_conn();
        param.user_info = await model.get_user_info_evt(s_u_info.ID);

        if(req.session.early_list_query){
            param.early_list = await model.set_query(req.session.early_list_query);
        }else{
            query = await model.get_early_list(s_u_info.ID, s_u_info.OFFICE_CODE, s_u_info.IS_ADMIN, s_u_info.POSITION, s_u_info.HEAD_OFFICE, s_u_info.OFFICE, s_u_info.GRADE);

            param.early_list = await model.set_query(query);
        }
        

        param.user_evaluate = s_u_info.e_id;
        param.grade = s_u_info.GRADE;
        param.position = s_u_info.position;
        param.is_admin = s_u_info.IS_ADMIN;

        await model.close_conn();
    }catch(err){
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/search", async function(req, res, next){
    var m_result, query;
    var s_u_info = req.session.user_info;

    try{
        await model.open_conn();

        query = await model.get_early_list(s_u_info.ID, s_u_info.OFFICE_CODE, s_u_info.IS_ADMIN, s_u_info.POSITION, s_u_info.HEAD_OFFICE, s_u_info.OFFICE, s_u_info.GRADE, JSON.parse(req.body.search_checked), req.body.select, req.body.search);
        m_result = await model.set_query(query);
        param.early_list = m_result;

        req.session.early_list_query = query;

        await model.close_conn();
    }catch(err){
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/evaluate", async function(req, res, next){
    var m_result;

    try{
        await model.open_conn();

        param.user_info = req.session.user_info;

        m_result = await model.get_evaluate_result(req.body.evaluate_id);
        param.result_list = m_result;

        m_result = await model.get_evaluate(req.body.evaluate_id);
        param.evaluate_state = m_result;

        m_result = await model.get_ability_q(m_result.GRADE);
        
        var ability_list = new Object();
        m_result.map((val, key) => {
        //    param.evaluate_state['EVALUATION_LIST'+(key+1)] = val.EVALUATION_LIST;
        //    param.evaluate_state['ABILITY_LIST'+(key+1)] = val.ABILITY_LIST;
        ability_list['EVALUATION_LIST'+(key+1)] = val.EVALUATION_LIST;
        ability_list['ABILITY_LIST'+(key+1)] = val.ABILITY_LIST;
        })
        param.ability_list = ability_list;

        await model.close_conn();
    }catch(err){
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/input_evaluate", async function(req, res, next){
    var m_result, query, query_2="";
    var s_u_info = req.session.user_info;
    var evaluate_state = new Object();
    var result_list = new Object();


    try{
        await model.open_conn();
        await model.use_tran();

        evaluate_state = JSON.parse(req.body.evaluate_state);
        result_list = JSON.parse(req.body.result_list);

        if(parseInt(req.body.add_state) === 1){
            evaluate_state.COMMENT = null;
        }else if(parseInt(req.body.add_state) === -1){
            //ステータスによって宛先のIDをもってきて情報をもってきてメールを送る。
            if(""+evaluate_state.STATUS === "10"){      //second_mail
                user_info = await model.get_login_info(evaluate_state.SECOND_ID);
            }else if(""+evaluate_state.STATUS === "9"){     //first_mail
                user_info = await model.get_login_info(evaluate_state.FIRST_ID);
            }else{      //user_mail
                user_info = await model.get_login_info(evaluate_state.USER_ID);
            }
            
            if(user_info){    
                await transprter.sendMail({
                    from : '',
                    to : user_info.MAIL,
                    subject : '人事評価シートの差戻し',
                    text : user_info.NAME+'様\nお疲れ様です。\n\n人事評価シートが差戻されましたので書き直していただきます。\n次は差戻された理由でございます。\n\n\n'+evaluate_state.COMMENT
                })
            }else{
                param.err = "このメールのユーザーがありません。";
            } 
        }
        
        evaluate_state.STATUS = parseInt(req.body.add_state) + parseInt(evaluate_state.STATUS);

        var sys_status = (await model.set_query("select STATUS, PERIOD, SEMESTER from Sys_Admin"))[0];

        //昔の評価シートも使えるよう変えたけどちゃんと作動しているかは不明
        if(evaluate_state.PERIOD != sys_status.PERIOD || evaluate_state.SEMESTER != sys_status != sys_status.SEMESTER){
            if((""+evaluate_state.STATUS === "3") || (""+evaluate_state.STATUS === "6")){
                evaluate_state.STATUS = parseInt(evaluate_state.STATUS) + 1;
            }
        }else if((""+evaluate_state.STATUS === "3" && ""+sys_status.STATUS === ""+4) || (""+evaluate_state.STATUS === "6" && ""+sys_status.STATUS === ""+7)){
            evaluate_state.STATUS = parseInt(evaluate_state.STATUS) + 1;
        }

        query ="update Evaluate set ";
        Object.keys(evaluate_state).map(key => {
            if(""+key == "ID" || ""+key == "UPDATE_DATE"){
            }else if(evaluate_state[key] == null){
                query += key + "=NULL,";
            }else{
                query += key + "='" + evaluate_state[key] + "',";
            }
        })
        query += "UPDATE_DATE = getdate()";
        query += " where ID = " + evaluate_state.ID;

        await model.set_query(query);

        result_list.map(val => {
            if(val["ID"] != undefined){
                query ="update Evaluate_Result set ";
                Object.keys(val).map(key => {
                    if(""+key == "ID" || ""+key == "UPDATE_DATE"){
                    }else if(val[key] == null){
                        query += key + "=NULL,";
                    }else{
                        query += key + "='" + val[key] + "',";
                    }
                })

                query += "UPDATE_DATE = getdate()";
                //query = query.substring(0, query.length-1);
                query += " where ID = " + val.ID+";";
                query_2 += query;
            }else{                               
                var query_v = " values(";
                query = "insert into Evaluate_Result("
                Object.keys(val).map(key => {

                    if(""+key == "ID"){
                    }else if(val[key] == null || val[key].length == 0){
                        query += key+",";
                        query_v +="NULL,";
                    }else{
                        query += key+",";
                        query_v +="'"+val[key]+"',";
                    }
                })
                
                query = query+"update_date, insert_date) "+ query_v+"getdate(), getdate());"
                query_2 += query;        
            }
        })

        await model.set_query(query_2);
        

        await model.commit();
        await model.close_conn();
    }catch(err){
        await model.rollback();
        await model.close_conn();
        param.err = err.message;
    }
    
    res.send(param);
})

router.post("/api/set_status", async function(req, res, next){
    var query, sys_status;

    try{
        await model.open_conn();
        await model.use_tran();

        query = "select STATUS,PERIOD from Sys_Admin";

        sys_status = (await model.set_query(query))[0];

        if(""+sys_status.STATUS === "1" || ""+sys_status.STATUS === "4"){
            query = "update Evaluate set STATUS = "+(parseInt(sys_status.STATUS)+3)+" where PERIOD = "+sys_status.PERIOD+" and STATUS = "+(parseInt(sys_status.STATUS)+2);
            await model.set_query(query);

            query = "update Sys_Admin set STATUS="+(parseInt(sys_status.STATUS)+3); 
            await model.set_query(query);
        }else{
            param.err = "ステータスを変更ができない時期です。";
            res.send(param);            
        }

        await model.commit();
        await model.close_conn();
    }catch(err){
        await model.rollback();
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/set_adminMSG", async function(req, res, next){
    var query;

    try{
        await model.open_conn();

        query = "update Sys_Admin set ADMIN_COMMENT = '"+req.body.adminMSG+"'";
        await model.set_query(query)

        await model.close_conn();
    }catch(err){
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/send_status", async function(req, res, next){
    var query, result, checked, mail_result;

    query="select e.STATUS, u.NAME, u.MAIL from Evaluate e left join User_Info u on e.USER_ID = u.ID where e.ID in("

    try{
        await model.open_conn();

        checked = JSON.parse(req.body.checked);

        Object.keys(checked).map(val => {
            query+=val+",";
        })
        query = query.substring(0, query.length-1) + ")";

        result = await model.set_query(query);

        for(var i = 0; i < result.length; i++){
            if(result){    
                mail_result = await transprter.sendMail({
                    from : '',
                    to : result[i].MAIL,
                    subject : '人事評価の現在のステータスのお知らせ',
                    text : result[i].NAME+'様\nお疲れ様です。\n\n'+result[i].NAME+'様のステータスは「'+result[i].STATUS+'」となっておりますので\n次のステータスに進めていただくようお願いします。\n\n\n'
                })
            }   
        } 

        await model.close_conn();
    }catch(err){
        await model.close_conn();
        param.err = err.message;
    }  

    res.send(param);
})

router.post("/api/set_Semester", async function(req, res, next){
    var query, adm_result;

    try{
        await model.open_conn();
        await model.use_tran();

        query = "select PERIOD, SEMESTER from Sys_Admin";
        adm_result = (await model.set_query(query))[0];

        if(""+adm_result.SEMESTER === "0"){
            query = "update Sys_Admin set SEMESTER = 1, STATUS = 1";
        }else{
            query = "update Sys_Admin set SEMESTER = 0, PERIOD = "+(parseInt(adm_result.PERIOD) + 1)+", STATUS = 1";
        }
        await model.set_query(query);

        await model.commit();
        await model.close_conn();
    }catch(err){
        await model.rollback();
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/update_evaluate", async function(req, res, next){
    var query1="", query2="";

    list = JSON.parse(req.body.update_info);

    try{
        await model.open_conn();
        await model.use_tran();

        list.map(val => {
            query1 += "update Evaluate set ";
            query2 += "update Salary_Info set ";
            
            constants.UPDATE_EVALUATE.map(ue_val =>{
                if(val[ue_val.id] === null || val[ue_val.id] === ''){
                    query1 += ue_val.id + "=NULL,";
                }else{                    
                    query1 += ue_val.id + "='" + val[ue_val.id] + "',";
                }
            })

            constants.UPDATE_SALARY_INFO.map(usi_val =>{
                if(val[usi_val.id] === null || val[usi_val.id] === ''){
                    query2 += usi_val.id + "=NULL,";
                }else{                    
                    query2 += usi_val.id + "='" + val[usi_val.id] + "',";
                }
            })

            query1 = query1.substring(0, query1.length-1) + " where ID = " + val.ID + ";";
            query2 = query2.substring(0, query2.length-1) + " where ID = " + val.ID + ";";
        })

        
        await model.set_query(query1);
        await model.set_query(query2);

        await model.commit();
        await model.close_conn();
    }catch(err){
        await model.rollback();
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/insert_evaluate", async function(req, res, next){
    var query1="", query2="", adm_id;

    list = JSON.parse(req.body.insert_info);

    try{
        await model.open_conn();
        await model.use_tran();

        adm_id = (await model.set_query("select EVALUATE_NUM from Sys_Admin"))[0]['EVALUATE_NUM'];

        list.map(val => {
            query1 += "insert into Evaluate(ID,PERIOD,SEMESTER,USER_ID,NAME,HEAD_OFFICE,OFFICE,GRADE,POSITION,STATUS,FIRST_ID,FIRST_EVALUATOR,F_E_HEAD_OFFICE,F_E_OFFICE,F_E_POSITION,SECOND_ID,SECOND_EVALUATOR,S_E_HEAD_OFFICE,S_E_OFFICE,S_E_POSITION,RESULT_SCORE_TOTAL,RESULT_F_E_TOTAL,RESULT_S_E_TOTAL,RESULT_F_E_RANK,RESULT_S_E_RANK,LAST_R_EVALUATE_RANK,AVERAGE,F_E_AVERAGE,S_E_AVERAGE,EVALUATE_F_E_RANK,EVALUATE_S_E_RANK,LAST_A_EVALUATE_RANK) values ( "+(adm_id)+",";
            query2 += "insert into Salary_Info(ID,BONUS,PROVISION_PER,CRITERION,BONUS_CRITERION,BEFORE_BONUS,CHANGE_AMOUNT,BEFORE_CHANGE_AMOUNT,NEW_GRADE,NEW_POSITION,NEW_SALARY,NEW_BASIC_AMOUNT,NEW_GRADE_AMOUNT,NEW_POSITION_AMOUNT,NEW_BUSINESS_AMOUNT,NEW_CONTINUED_AMOUNT,NEW_ADJUSTMENT,NOW_SALARY_AMOUNT,NOW_BASIC_AMOUNT,NOW_GRADE_AMOUNT,NOW_POSITION_AMOUNT,NOW_BUSINESS_AMOUNT,NOW_CONTINUED_AMOUNT,NOW_ADJUSTMENT,CONSIDERATION) values ("+(adm_id++)+",";
            
            for(var i = 0 ; i < 55; i++){
                if(i <= 30){
                    query1 += "'"+val[i]+"',"
                }else{
                    query2 += "'"+val[i]+"',"
                }
            }           

            query1 = query1.substring(0, query1.length-1) + ");";
            query2 = query2.substring(0, query2.length-1) + ");";
        })

        await model.set_query(query1);
        await model.set_query(query2);
        await model.set_query("update Sys_Admin set EVALUATE_NUM = "+adm_id);

        await model.commit();
        await model.close_conn();
    }catch(err){
        await model.rollback();
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/get_user_list", async function(req, res, next){
    var query, result;


    if(!req.session.user_info.IS_ADMIN){
        param.err = "間違った経路です。";
        res.send(param);
    }
    
    try{
        await model.open_conn();

        query = "select * from User_Info";

        result = await model.set_query(query);

        param.user_info = result;

        await model.close_conn();
    }catch(err){
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/search_user_info", async function(req, res, next){
    var query, result;
    
    try{
        await model.open_conn();

        if(req.body.select != null && req.body.search != null && req.body.search != ""){
            query = "select * from User_Info where "+req.body.select+"='"+req.body.search+"'";
        }else{
            query = "select * from User_Info";
        }

        result = await model.set_query(query);

        param.user_info = result;

        await model.close_conn();
    }catch(err){
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

router.post("/api/update_user_info", async function(req, res, next){
    var query="";

    list = JSON.parse(req.body.update_info);

    try{
        await model.open_conn();
        await model.use_tran();

        list.map(val => {
            query += "update User_Info set ";
            
            constants.UPDATE_USER_INFO.map(ue_val =>{
                if(val[ue_val.id] === null || val[ue_val.id] === ''){
                    query += ue_val.id + "=NULL,";
                }else{                    
                    query += ue_val.id + "='" + val[ue_val.id] + "',";
                }
            })

            query = query.substring(0, query.length-1) + " where AUTO_ID = " + val.AUTO_ID + ";";
        })
        
        await model.set_query(query);

        await model.commit();
        await model.close_conn();
    }catch(err){
        await model.rollback();
        await model.close_conn();
        param.err = err.message;
    }

    console.log(query);

    res.send(param);
})

router.post("/api/insert_user_info", async function(req, res, next){
    var query = "";

    list = JSON.parse(req.body.insert_info);

    try{
        await model.open_conn();
        await model.use_tran();

        list.map(val => {
            query += "insert into User_Info values ( 0,";
           
            for(var i = 0 ; i < 16; i++){
                if(val[i].length === 0){
                    query += "NULL,"
                }else{
                    query += "'"+val[i]+"',"
                }
            }           

            query = query.substring(0, query.length-1) + ");";
        })

        console.log(query);

        await model.set_query(query);

        await model.commit();
        await model.close_conn();
    }catch(err){
        await model.rollback();
        await model.close_conn();
        param.err = err.message;
    }

    res.send(param);
})

module.exports = router;


var constants = require('./constants');

const config = constants.config;

const sql = require('mssql');

class Model{

  constructor(){
    this.sql_command;
    this.transaction;
  }

  async open_conn(){
    await sql.connect(config);
    this.sql_command = await new sql.Request();
  }

  async close_conn(){
    await sql.close();
  }

  async set_query(query){
    var result;

    result = await this.sql_command.query(query);
  
    return result.recordset;
  }

  async use_tran(){
    this.transaction = await new sql.Transaction();
    await this.transaction.begin();
    this.sql_command = await new sql.Request(this.transaction);
  }

  async commit(){
    await this.transaction.commit();
  }

  async rollback(){
    await this.transaction.rollback();
  }
  
  async get_login_info(user_id){
    var result;

    var result = await this.sql_command.query("select u.*, e.ID as e_id from User_Info u left join Evaluate e on u.ID = e.USER_ID and e.PERIOD = (select PERIOD from Sys_Admin) and e.SEMESTER = (select SEMESTER from Sys_Admin) where u.ID = "+user_id)

    return result.recordset[0];
  }

  async get_admin_comment(){
    var result;

    var result = await this.sql_command.query("select ADMIN_COMMENT from Sys_Admin")

    return result.recordset[0];
  }

  async reset_pswd(id, pswd){
    var result;

    var result = await this.sql_command.query("update User_Info set password = '"+pswd+"' where id = '"+id+"'");

    return result;
  }

  async get_user_info_evt(id){
    var result;

    var result = await this.sql_command.query("SELECT [ID],[NAME],ISNULL([HEAD_OFFICE], '') HEAD_OFFICE,ISNULL([OFFICE], '') OFFICE,ISNULL([GRADE], '') GRADE,ISNULL([POSITION], '') POSITION,ISNULL((select status from Evaluate where user_id = "+id+" and  PERIOD = (select period from Sys_Admin) and SEMESTER = (select SEMESTER from Sys_Admin)), '') STATUS FROM [HR_Evaluate].[dbo].[User_Info] where ID ="+id);

    return result.recordset[0];
  }

  async get_early_list(id, office_code, is_admin, position, head_office, office, grade, search_checked, select, search){
    var query, result, query_col, query_col2, q_where = "";

    result = await this.sql_command.query("select id from User_info where FIRST_EVALUATOR_ID = "+id+" or SECOND_EVALUATOR_ID = "+id+"");
    
    query_col = "e.PERIOD,e.SEMESTER,e.ID,e.USER_ID,e.NAME,e.HEAD_OFFICE,e.OFFICE,e.GRADE,e.POSITION,e.STATUS,e.FIRST_ID,e.FIRST_EVALUATOR,e.F_E_HEAD_OFFICE,e.F_E_OFFICE,e.F_E_POSITION,e.SECOND_ID,e.SECOND_EVALUATOR,e.S_E_HEAD_OFFICE,e.S_E_OFFICE,e.S_E_POSITION,e.RESULT_SCORE_TOTAL,e.RESULT_F_E_TOTAL,e.RESULT_S_E_TOTAL,e.RESULT_F_E_RANK,e.RESULT_S_E_RANK,e.LAST_R_EVALUATE_RANK,e.AVERAGE,e.F_E_AVERAGE,e.S_E_AVERAGE,e.EVALUATE_F_E_RANK,e.EVALUATE_S_E_RANK,e.LAST_A_EVALUATE_RANK";
    query_col2 = " ,s.BONUS,s.PROVISION_PER,s.CRITERION,s.BONUS_CRITERION,s.BEFORE_BONUS,s.CHANGE_AMOUNT,s.BEFORE_CHANGE_AMOUNT,s.NEW_GRADE,s.NEW_POSITION,s.NEW_SALARY,s.NEW_BASIC_AMOUNT,s.NEW_GRADE_AMOUNT,s.NEW_POSITION_AMOUNT,s.NEW_BUSINESS_AMOUNT,s.NEW_CONTINUED_AMOUNT,s.NEW_ADJUSTMENT,s.NOW_SALARY_AMOUNT,s.NOW_BASIC_AMOUNT,s.NOW_GRADE_AMOUNT,s.NOW_POSITION_AMOUNT,s.NOW_BUSINESS_AMOUNT,s.NOW_CONTINUED_AMOUNT,s.NOW_ADJUSTMENT,s.CONSIDERATION";
    
    if(search_checked == undefined || ""+search_checked.past == "false"){
      q_where += " and e.PERIOD = (select period from Sys_Admin) and e.SEMESTER = (select SEMESTER from Sys_Admin)";
    }

    if(search_checked != undefined){

      if(""+search_checked.semester0 == "true" && ""+search_checked.semester1 == "false"){
        q_where += " and e.SEMESTER = 0";
      }
      if(""+search_checked.semester1 == "true" && ""+search_checked.semester0 == "false"){
        q_where += " and e.SEMESTER = 1";
      }
      if(select != null && search != null && search != ""){
        q_where += " and e."+select+" = '"+search+"' ";
      }
  
      if(is_admin){
        if(""+search_checked.is_shop0 == "true" && ""+search_checked.is_shop1 == "false"){
          q_where += " and u.IS_SHOP = 0";
        }
        if(""+search_checked.is_shop1 == "true" && ""+search_checked.is_shop0 == "false"){
          q_where += " and u.IS_SHOP = 1";
        }
      }

    }

    q_where += " order by period desc, semester desc, user_id desc";

    if(is_admin || position == "社長"){
      query = "select "+query_col+query_col2+" from Evaluate e left join Salary_Info s on e.ID = s.ID left join (select IS_SHOP, ID from User_Info) u on e.USER_ID = u.ID where e.ID IS NOT NULL "+q_where;
    }else if(position == "本部長" || grade == "G7"){
      query = "select "+query_col+query_col2+" from Evaluate e left join  Salary_Info s on e.ID = s.ID left join (select ID, HEAD_OFFICE from User_Info) as u on e.USER_ID = u.ID where u.head_office = '"+head_office+"' "+" and ((e.PERIOD < (select period from Sys_Admin)) or (e.PERIOD = (select period from Sys_Admin) and e.SEMESTER <= (select semester from Sys_Admin)))"+q_where;
    }else if(position == "部長"){
      query = "select "+query_col+" from Evaluate e left join (select ID, OFFICE from User_Info) as u on e.USER_ID = u.ID where u.office = '"+office+"'"+" and ((e.PERIOD < (select period from Sys_Admin)) or (e.PERIOD = (select period from Sys_Admin) and e.SEMESTER <= (select semester from Sys_Admin)))"+q_where;
    }else if(result.recordset.length != 0){
      query = "select "+query_col+" from Evaluate e where e.office = '"+office+"' and e.user_id in('";

      for(var i =0; i < result.recordset.length; i ++){
        query += result.recordset[i].id + "','";
      }

      query += id + "')";
      //query = query.substring(0, (query.length - 2)) + ")";
      query += " and ((e.PERIOD < (select period from Sys_Admin)) or (e.PERIOD = (select period from Sys_Admin) and e.SEMESTER <= (select semester from Sys_Admin)))"+q_where;
    }else{
      query = "select "+query_col+" from Evaluate e where e.user_id = "+id+" and ((e.PERIOD < (select period from Sys_Admin)) or (e.PERIOD = (select period from Sys_Admin) and e.SEMESTER <= (select semester from Sys_Admin)))"+q_where;
    }

    /*
    result = await this.sql_command.query(query);

    return result.recordset;
    */

    return query;
  }

  async get_evaluator_info(evaluator_id){
    var result;

    var result = await this.sql_command.query("select NAME, HEAD_OFFICE, OFFICE, POSITION from User_Info where ID="+evaluator_id);

    return result.recordset[0];
  }

  async get_evaluate(evaluate_id){
    var result;

    var result = await this.sql_command.query("select * from Evaluate where id = "+evaluate_id);

    return result.recordset[0];
  }

  async get_evaluate_result(evaluate_id){
    var result;

    var result = await this.sql_command.query("select * from Evaluate_Result where evaluate_id = "+evaluate_id);

    return result.recordset;
  }

  async get_ability_q(grade){
    var result;

    var result = await this.sql_command.query("select EVALUATION_LIST, ABILITY_LIST from Ability_Qualification where grade = '"+grade+"'");

    return result.recordset;
  }
}


module.exports=new Model();


/*
  async get_fun(){
    var sql_command;
    var result;

    await sql.connect(config);

    sql_command = await new sql.Request(); 

    var result = await sql_command.query("select * from Sys_Admin")
    
    await sql.close();

    return result.recordset[0];
  }
  */
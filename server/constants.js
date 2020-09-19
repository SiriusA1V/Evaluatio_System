const constants = {

//  APP_URL : "",
//  WEB_URL : "",
// APP_URL_PORT : ,
//  WEB_URL_PORT : ,
  APP_URL : "",
  WEB_URL : "",
  APP_URL_PORT : ,
  WEB_URL_PORT : ,
  
/*  
  config : {
    server : '',
    port : ,
    user : '',
    password : '',
    database : '',
    stream : true,

    options : {
      encryt : true
    }
},
*/

config : {
  server : '',
  user : '',
  password : '',
  database : '',
  stream : true,

  options : {
    encryt : true
  }
},



    UPDATE_EVALUATE : [
        { subject: '期', id : "PERIOD"},
        { subject: '半期', id : "SEMESTER"},
        { subject: 'ID', id : "USER_ID"},
        { subject: '氏名', id : "NAME"},
        { subject: '本部', id : "HEAD_OFFICE"},
        { subject: '部', id : "OFFICE"},
        { subject: 'グレード', id : "GRADE"},
        { subject: '役職・職位', id : "POSITION"},
        { subject: 'ステータス', id : "STATUS"},
        { id: 'FIRST_ID', subject : "1次評価者ID"},
        { id: 'FIRST_EVALUATOR', subject : "1次評価者名"},
        { id: 'F_E_HEAD_OFFICE', subject : "1次評価者本部"},
        { id: 'F_E_OFFICE', subject : "1次評価者部"},
        { id: 'F_E_POSITION', subject : "1次評価者役職"},
        { id: 'SECOND_ID', subject : "2次評価者ID"},
        { id: 'SECOND_EVALUATOR', subject : "2次評価者名"},
        { id: 'S_E_HEAD_OFFICE', subject : "2次評価者本部"},
        { id: 'S_E_OFFICE', subject : "2次評価者部"},
        { id: 'S_E_POSITION', subject : "2次評価者役職"},
        { subject: '合計(個人)', id : "RESULT_SCORE_TOTAL"},
        { subject: '合計(1次)', id : "RESULT_F_E_TOTAL"},
        { subject: '合計(2次)', id : "RESULT_S_E_TOTAL"},
        { subject: '成果評価ランク(1次)', id : "RESULT_F_E_RANK"},
        { subject: '成果評価ランク(2次)', id : "RESULT_S_E_RANK"},
        { subject: '成果最終評価ランク', id : "LAST_R_EVALUATE_RANK"},
        { subject: '平均', id : "AVERAGE"},
        { subject: '1次評価平均', id : "F_E_AVERAGE"},
        { subject: '2次評価平均', id : "S_E_AVERAGE"},
        { subject: '能力評価ランク(1次)', id : "EVALUATE_F_E_RANK"},
        { subject: '能力評価ランク(2次)', id : "EVALUATE_S_E_RANK"},
        { subject: '能力最終評価ランク', id : "LAST_A_EVALUATE_RANK"}
      ],
    
      UPDATE_SALARY_INFO : [
        { subject: '賞与確定額', id : "BONUS"},
        { subject: '賞与支給率', id : "PROVISION_PER"},
        { subject: '基準', id : "CRITERION"},
        { subject: '賞与基準額', id : "BONUS_CRITERION"},
        { subject: '前回賞与額', id : "BEFORE_BONUS"},
        { subject: '給与変更額', id : "CHANGE_AMOUNT"},
        { subject: '前回昇給額', id : "BEFORE_CHANGE_AMOUNT"},
        { subject: '新グレード', id : "NEW_GRADE"},
        { subject: '新役職', id : "NEW_POSITION"},
        { subject: '新支給額合計', id : "NEW_SALARY"},
        { subject: '新基本給', id : "NEW_BASIC_AMOUNT"},
        { subject: '新役職手当', id : "NEW_GRADE_AMOUNT"},
        { subject: '新職位手当', id : "NEW_POSITION_AMOUNT"},
        { subject: '新営業手当', id : "NEW_BUSINESS_AMOUNT"},
        { subject: '新勤続給', id : "NEW_CONTINUED_AMOUNT"},
        { subject: '新調整給', id : "NEW_ADJUSTMENT"},
        { subject: '現支給額合計', id : "NOW_SALARY_AMOUNT"},
        { subject: '現基本給', id : "NOW_BASIC_AMOUNT"},
        { subject: '現役職手当', id : "NOW_GRADE_AMOUNT"},
        { subject: '現職位手当', id : "NOW_POSITION_AMOUNT"},
        { subject: '現営業手当', id : "NOW_BUSINESS_AMOUNT"},
        { subject: '現勤続給', id : "NOW_CONTINUED_AMOUNT"},
        { subject: '現調整給', id : "NOW_ADJUSTMENT"},
        { subject: '昇進・昇格検討', id : "CONSIDERATION"},
      ],

      UPDATE_USER_INFO : [
        { subject : '所属', id : 'IS_SHOP'},
        { subject : 'ID', id : 'ID'},
        { subject : 'パスワード', id : 'PASSWORD'},
        { subject : '氏名', id : 'NAME'},
        { subject : 'メール', id : 'MAIL'},
        { subject : '誕生日', id : 'BIRTHDAY'},
        { subject : '入社日', id : 'JOINED_DAY'},
        { subject : '本部コード', id : 'OFFICE_CODE'},
        { subject : '本部', id : 'HEAD_OFFICE'},
        { subject : '部', id : 'OFFICE'},
        { subject : 'グレード', id : 'GRADE'},
        { subject : '役職', id : 'POSITION'},
        { subject : '1次評価者ID', id : 'FIRST_EVALUATOR_ID'},
        { subject : '1次評価者氏名', id : 'FIRST_EVALUATOR'},
        { subject : '2次評価者ID', id : 'SECOND_EVALUATOR_ID'},
        { subject : '2次評価者氏名', id : 'SECOND_EVALUATOR'},
      ]
}

  module.exports = constants;
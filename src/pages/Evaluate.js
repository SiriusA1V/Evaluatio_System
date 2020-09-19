import React, {Component, Fragment} from 'react';
import {TextField, Button, Paper, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, OutlinedInput} from '@material-ui/core';
import css_styles from '../css/Styles.scss';
import classNames from 'classnames/bind';
import axios from 'axios';
import * as constants from '../const/constants';
import {Link} from 'react-router-dom';
import { truncate } from 'fs';

const SERVER_URL = constants.SERVER_URL;
const REACT_URL = constants.REACT_URL;
const cx = classNames.bind(css_styles);
const eval_user1 = constants.EVAL_USER1;
const eval_user2 = constants.EVAL_USER2;
const eval_user3 = constants.EVAL_USER3;
const eval_user4 = constants.EVAL_USER4;
const eval_result = constants.EVAL_RESULT;
const eval_ability = constants.EVAL_ABILITY;
var LIMITATION = constants.LIMITATION;

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1;
    var dd = this.getDate();
  
    return [this.getFullYear() + "/",
            (mm>9 ? '' : '0') + mm + "/",
            (dd>9 ? '' : '0') + dd
           ].join('');
};

class Evaluate extends Component{
    state = {

        page_loading : false,
        evaluate_id : undefined,
        is_button : true,

        user_info : {},
        
        result_list_base : {
            EVALUATE_ID : "",
            RESULT_SUBJECT : "",
            RESULT_CONTENTS : "",
            WEIGHT : "",
            RESULT : "",
            COMMENT : "",
            SCORE : "",
            F_E_COMMENT : "",
            F_E_SCORE : "",
            S_E_SCORE : ""
        },
        
        limitation : LIMITATION,

        result_list : [],
        evaluate_state : {},
        ability_list : {},
        
        final_weight : 0
    }

    constructor(props){
        super(props)
        this.state.evaluate_id = props.location.state.evaluate_id;
    }

    componentDidMount(){
        axios({
            method: 'post',
            url: SERVER_URL+"/evaluate",
            withCredentials: true,
            data:{
                evaluate_id : this.state.evaluate_id
            }
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
                this.props.history.push("/");
            }else{
                var final_weight=0;

                response.data.result_list.map(val => {
                    final_weight += val.WEIGHT;
                })

                if(!response.data.result_list.length){
                    this.setState({
                        page_loading : true,
                        user_info : response.data.user_info,
                        evaluate_state : response.data.evaluate_state,
                        ability_list : response.data.ability_list,
                        final_weight : final_weight,
                        result_list_base : {
                            ...this.state.result_list_base,
                            EVALUATE_ID : response.data.evaluate_state.ID, 
                        }
                    })

                    this.onclick_add_row();
                    this.onclick_add_row();
                    this.onclick_add_row();
                }else{
                    this.setState({
                        page_loading : true,
                        user_info : response.data.user_info,
                        evaluate_state : response.data.evaluate_state,
                        result_list : response.data.result_list,
                        ability_list : response.data.ability_list,
                        final_weight : final_weight,
                        result_list_base : {
                            ...this.state.result_list_base,
                            EVALUATE_ID : response.data.evaluate_state.ID, 
                        }
                    })
                }

                var data = response.data;
                this.set_limitation(data.user_info.IS_ADMIN,data.user_info.ID, data.evaluate_state.USER_ID, data.evaluate_state.FIRST_ID, data.evaluate_state.SECOND_ID, data.evaluate_state.STATUS);
            }
        }).catch(error => {
            alert("サーバーとの接続が不安定です。");
            this.props.history.push("/");
        })
    }

    set_limitation=(is_admin,user_id, e_id, f_id, s_id, status)=>{
        if(""+user_id !== ""+e_id && ""+user_id !== ""+f_id && ""+user_id !== ""+s_id && ""+is_admin !== ""+1){
            return;
        }

        if(""+user_id === ""+e_id ){
            switch(status){
                case 1:
                    this.setState({
                        limitation :{
                            ...this.state.limitation,
                            result : {
                                ...this.state.limitation.result,
                                RESULT_SUBJECT : true,
                                RESULT_CONTENTS : true,
                                WEIGHT : true,
                                /*
                                S_E_SCORE : true,
                                F_E_SCORE : true
                                */
                            },
                            SAVE : true,
                            SUBMIT : true,
                            ADD_ROW : true,
                            /*
                            evaluate : {
                                ...this.state.limitation.evaluate,
                                SCORE1 : true,
                                SCORE2 : true,
                                SCORE3 : true,
                                SCORE4 : true,
                                SCORE5 : true,
                                F_E_SCORE1 : true,
                                F_E_SCORE2 : true,
                                F_E_SCORE3 : true,
                                F_E_SCORE4 : true,
                                F_E_SCORE5 : true,
                                S_E_SCORE1 : true,
                                S_E_SCORE2 : true,
                                S_E_SCORE3 : true,
                                S_E_SCORE4 : true,
                                S_E_SCORE5 : true,
                            },
                            */
                        }
                    })
                    break;
                case 4:
                        this.setState({
                            limitation :{
                                ...this.state.limitation,
                                evaluate : {
                                    ...this.state.limitation.evaluate,
                                    MIDDLE_INTERVIEW_COMMENT : true,
                                    MIDDLE_INTERVIEW_DATE : true
                                },
                                SAVE : true,
                                SUBMIT : true
                            }
                        })
                    break;
                case 7:
                    this.setState({
                        limitation :{
                            ...this.state.limitation,
                            result : {
                                ...this.state.limitation.result,
                                RESULT : true,
                                COMMENT : true,
                                SCORE : true
                            },
                            evaluate : {
                                ...this.state.limitation.evaluate,
                                U_COMMENT : true,
                                SCORE1 : true,
                                SCORE2 : true,
                                SCORE3 : true,
                                SCORE4 : true,
                                SCORE5 : true,
                                SCORE6 : true,
                                FINAL_INTERVIEW_COMMENT : true,
                                FINAL_INTERVIEW_DATE : true
                            },
                            SAVE : true,
                            SUBMIT : true
                        }
                    })
                    break;
            }
        }

        if(""+user_id === ""+f_id ){
            switch(status){
                case 2:
                    this.setState({
                        limitation :{
                            ...this.state.limitation,
                            evaluate :{
                                ...this.state.limitation.evaluate,
                                COMMENT : true
                            },
                            SAVE : true,
                            SUBMIT :true,
                            RETURN : true
                        }
                    })
                    break;
                case 5:
                    this.setState({
                        limitation :{
                            ...this.state.limitation,
                            evaluate :{
                                ...this.state.limitation.evaluate,
                                M_I_EVALUATOR_COMMENT : true,
                                COMMENT : true
                            },
                            SAVE : true,
                            SUBMIT : true,
                            RETURN : true
                        },
                    })
                    break;
                case 8:
                    this.setState({
                        limitation :{
                            ...this.state.limitation,
                            result : {
                                ...this.state.limitation.result,
                                F_E_COMMENT : true,
                                F_E_SCORE : true
                            },
                            evaluate :{
                                ...this.state.limitation.evaluate,
                                F_E_COMMENT : true,
                                F_E_SCORE1 : true,
                                F_E_SCORE2 : true,
                                F_E_SCORE3 : true,
                                F_E_SCORE4 : true,
                                F_E_SCORE5 : true,
                                F_E_SCORE6 : true,
                                F_I_EVALUATOR_COMMENT : true,
                                COMMENT : true
                            },
                            SAVE : true,
                            SUBMIT : true,
                            RETURN : true,
                        }
                    })
                    break;
                case 11:
                    this.setState({
                        limitation :{
                            ...this.state.limitation,
                            evaluate :{
                                ...this.state.limitation.evaluate,
                                LAST_R_EVALUATE_COMMENT : true,
                                LAST_A_EVALUATE_COMMENT : true
                            },
                            SAVE : true,
                            SUBMIT : true
                        }
                    })
                    break;
            }
        }
        if(""+user_id === ""+s_id ){
            switch(status){
                case 9:
                    this.setState({
                        limitation :{
                            ...this.state.limitation,
                            result : {
                                ...this.state.limitation.result,
                                S_E_SCORE : true
                            },
                            evaluate :{
                                ...this.state.limitation.evaluate,
                                S_E_SCORE1 : true,
                                S_E_SCORE2 : true,
                                S_E_SCORE3 : true,
                                S_E_SCORE4 : true,
                                S_E_SCORE5 : true,
                                S_E_SCORE6 : true,
                                COMMENT : true
                            },
                            SAVE : true,
                            SUBMIT : true,
                            RETURN : true
                        }
                    })
                    break;
            }
        }

        if(""+is_admin === ""+1 ){
            switch(status){
                case 10:
                    this.setState({
                        limitation :{
                            ...this.state.limitation,
                            evaluate :{
                                ...this.state.limitation.evaluate,
                                LAST_R_EVALUATE_RANK : true,
                                LAST_A_EVALUATE_RANK : true,
                                COMMENT : true
                            },
                            SAVE : true,
                            SUBMIT : true,
                            RETURN : true
                        }
                    })
                    break;
            }
        }
    }

    onchange_result_list=(e)=>{
        var sv_last_weight = 0, sv_last_user = 0, sv_last_first = 0, sv_last_second = 0, f_e_rank, s_e_rank;
        var map_sv_last_weight = 0, map_sv_last_user = 0, map_sv_last_first = 0, map_sv_last_second = 0;

        if(isNaN(e.target.value)){
            alert("数字だけ入力できます。テンキーパッドやローマ字の数字で入力してください");
            return;
        }
        

        this.state.result_list.map((val, key) =>(            
            ""+key === e.target.name.split("/")[0] ?
            (
                map_sv_last_weight = e.target.name.split("/")[1] ===  "WEIGHT" ? (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value)) : (isNaN(parseFloat(val.WEIGHT)) ? 0 : parseFloat(val.WEIGHT)),
                map_sv_last_user = e.target.name.split("/")[1] ===  "SCORE" ? (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value)) : (isNaN(parseFloat(val.SCORE)) ? 0 : parseFloat(val.SCORE)),
                map_sv_last_first = e.target.name.split("/")[1] ===  "F_E_SCORE" ? (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value)) : (isNaN(parseFloat(val.F_E_SCORE)) ? 0 : parseFloat(val.F_E_SCORE)),
                map_sv_last_second = e.target.name.split("/")[1] ===  "S_E_SCORE" ? (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value)) : (isNaN(parseFloat(val.S_E_SCORE)) ? 0 : parseFloat(val.S_E_SCORE))
            )
            : 
            (
                map_sv_last_weight = isNaN(parseFloat(val.WEIGHT)) ? 0 : parseFloat(val.WEIGHT),
                map_sv_last_user = isNaN(parseFloat(val.SCORE)) ? 0 : parseFloat(val.SCORE),
                map_sv_last_first = isNaN(parseFloat(val.F_E_SCORE)) ? 0 : parseFloat(val.F_E_SCORE),
                map_sv_last_second = isNaN(parseFloat(val.S_E_SCORE)) ? 0 : parseFloat(val.S_E_SCORE)
            ),

            sv_last_weight += map_sv_last_weight,
            sv_last_user += (map_sv_last_weight / 100) * map_sv_last_user,
            sv_last_first += (map_sv_last_weight / 100) * map_sv_last_first,
            sv_last_second += (map_sv_last_weight / 100) * map_sv_last_second
        ))

        if(sv_last_first !== 0){
            if(sv_last_first < 70){
                f_e_rank = "C";
            }else if(sv_last_first < 85){
                f_e_rank = "B";            
            }else if(sv_last_first < 95){
                f_e_rank = "A-";            
            }else if(sv_last_first < 100){
                f_e_rank = "A";            
            }else if(sv_last_first < 110){
                f_e_rank = "A+";            
            }else if(sv_last_first < 120){
                f_e_rank = "S";            
            }else{
                f_e_rank = "SS";            
            }
        }

        if(sv_last_second !== 0){
            if(sv_last_second < 70){
                s_e_rank = "C";
            }else if(sv_last_second < 85){
                s_e_rank = "B";            
            }else if(sv_last_second < 95){
                s_e_rank = "A-";            
            }else if(sv_last_second < 100){
                s_e_rank = "A";            
            }else if(sv_last_second < 110){
                s_e_rank = "A+";            
            }else if(sv_last_second < 120){
                s_e_rank = "S";            
            }else{
                s_e_rank = "SS";            
            }
        }

        const { result_list } = this.state;
        this.setState({
            result_list : result_list.map(
                (info, key) => ""+key === e.target.name.split("/")[0]
                ? ({...info, [e.target.name.split("/")[1]] : e.target.value})
                : info
            ),
            final_weight : sv_last_weight.toFixed(1),
            evaluate_state : {
                ...this.state.evaluate_state,
                RESULT_SCORE_TOTAL : sv_last_user.toFixed(1),
                RESULT_F_E_TOTAL : sv_last_first.toFixed(1),
                RESULT_S_E_TOTAL : sv_last_second.toFixed(1),
                RESULT_F_E_RANK : f_e_rank,
                RESULT_S_E_RANK : s_e_rank
            }
        })
    }

    onclick_add_row=()=>{
        var sv_result_list = JSON.parse(JSON.stringify(this.state.result_list));
        var sv_result_list_0 = JSON.parse(JSON.stringify(this.state.result_list_base));
        sv_result_list.push(sv_result_list_0)

        this.setState({
            result_list : sv_result_list
        })
    }

    onchange_result_comment=(e)=>{
        const { result_list } = this.state;
        this.setState({
            result_list : result_list.map(
                (info, key) => ""+key === e.target.name.split("/")[0]
                ? ({...info, [e.target.name.split("/")[1]] : e.target.value})
                : info
            )
        })
    }

    onchange_coment=(e)=>{
        this.setState({
            evaluate_state : {
                ...this.state.evaluate_state,
                [e.target.name] : e.target.value
            }
        })
    }

    onclick_logout = () =>{
        axios({
            method: 'post',
            url: SERVER_URL+"/logout",
            withCredentials: true,
        }).then(response => {
            if(response.data){
                window.location.assign("/");
            }else{
                alert("ログアウトするとき問題が発生しました。");
            }
        }).catch(error => {
        })
    }

    input_evaluate = () =>{

        if(this.state.is_button){
            this.setState({
                is_button : false
            })
        }else{
            return;
        }

        axios({
            method: 'post',
            url: SERVER_URL+"/input_evaluate",
            withCredentials: true,
            data:{
                result_list : JSON.stringify(this.state.result_list),
                evaluate_state : JSON.stringify(this.state.evaluate_state),
                add_state : 0
            }
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                alert("一時保存されました。");
            }
            this.setState({
                is_button : true
            })
        }).catch(error => {
            this.setState({
                is_button : true
            })
            alert("サーバーが不安定です。")
        })
    }

    onchange_ability_list = (e) =>{
        var score = 0, f_e_score = 0, s_e_score = 0, f_e_rank, s_e_rank;

        if(e.target.name.split("/")[2] == 14){
            this.setState({
                evaluate_state : {
                    ...this.state.evaluate_state,
                    [e.target.name.split("/")[1]] : e.target.value
                }
            })

            return;
        }

        if(""+e.target.name !== "0/F_E_COMMENT/18" && ""+e.target.name !== "0/U_COMMENT/18" && isNaN(e.target.value)){
            alert("数字だけ入力できます。テンキーパッドやローマ字の数字で入力してください");
            return;
        }

        for(var i = 0; i < 6; i++){
            if(""+i === e.target.name.split("/")[0]){
                score += e.target.name.split("/")[1] ===  "SCORE"+(i+1) ? (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value)) : (isNaN(parseFloat(this.state.evaluate_state['SCORE'+(i+1)])) ? 0 : parseFloat(this.state.evaluate_state['SCORE'+(i+1)]));
                f_e_score += e.target.name.split("/")[1] ===  "F_E_SCORE"+(i+1) ? (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value)) : (isNaN(parseFloat(this.state.evaluate_state['F_E_SCORE'+(i+1)])) ? 0 : parseFloat(this.state.evaluate_state['F_E_SCORE'+(i+1)]));
                s_e_score += e.target.name.split("/")[1] ===  "S_E_SCORE"+(i+1) ? (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value)) : (isNaN(parseFloat(this.state.evaluate_state['S_E_SCORE'+(i+1)])) ? 0 : parseFloat(this.state.evaluate_state['S_E_SCORE'+(i+1)]));
            }else{
                score += isNaN(parseFloat(this.state.evaluate_state['SCORE'+(i+1)])) ? 0 : parseFloat(this.state.evaluate_state['SCORE'+(i+1)]);
                f_e_score += isNaN(parseFloat(this.state.evaluate_state['F_E_SCORE'+(i+1)])) ? 0 : parseFloat(this.state.evaluate_state['F_E_SCORE'+(i+1)]);
                s_e_score += isNaN(parseFloat(this.state.evaluate_state['S_E_SCORE'+(i+1)])) ? 0 : parseFloat(this.state.evaluate_state['S_E_SCORE'+(i+1)]);
            }
        }

        score = score/6;
        f_e_score = f_e_score/6;
        s_e_score = s_e_score/6;

        if(f_e_score !== 0){
            if(f_e_score < 70){
                f_e_rank = "C";
            }else if(f_e_score < 90){
                f_e_rank = "B";            
            }else if(f_e_score < 95){
                f_e_rank = "A-";            
            }else if(f_e_score < 100){
                f_e_rank = "A";            
            }else if(f_e_score < 105){
                f_e_rank = "A+";            
            }else if(f_e_score < 110){
                f_e_rank = "S";            
            }else{
                f_e_rank = "SS";            
            }
        }

        if(s_e_score !== 0){
            if(s_e_score < 70){
                s_e_rank = "C";
            }else if(s_e_score < 90){
                s_e_rank = "B";            
            }else if(s_e_score < 95){
                s_e_rank = "A-";            
            }else if(s_e_score < 100){
                s_e_rank = "A";            
            }else if(s_e_score < 105){
                s_e_rank = "A+";            
            }else if(s_e_score < 110){
                s_e_rank = "S";            
            }else{
                s_e_rank = "SS";            
            }
        }

        this.setState({
            evaluate_state : {
                ...this.state.evaluate_state,
                [e.target.name.split("/")[1]] : e.target.value,
                AVERAGE : score.toFixed(1),
                F_E_AVERAGE : f_e_score.toFixed(1),
                S_E_AVERAGE : s_e_score.toFixed(1),
                EVALUATE_F_E_RANK : f_e_rank,
                EVALUATE_S_E_RANK : s_e_rank,
            }
        })
    }

    onClick_submit=()=>{
        var is_err = false;

        if(this.state.is_button){
            this.setState({
                is_button : false
            })
        }else{
           return; 
        }

        Object.keys(this.state.limitation.result).map(key =>{
            this.state.result_list.map(val=>{
                if(this.state.limitation.result[key] === true && (val[key] === null || val[key].length < 1)){
                    is_err = true;
                }
            })            
        })
        Object.keys(this.state.limitation.evaluate).map(key =>{
            if(""+key !== "COMMENT" && this.state.limitation.evaluate[key] === true && (this.state.evaluate_state[key] === null || this.state.evaluate_state[key].length < 1)){
                is_err = true;                
            }
        })

        if(is_err){
            alert("入力してない項目があります。");
            this.setState({
                is_button : true
            })
            return;
        }
        if(this.state.final_weight != 100){
            alert("ウエイトは100%にしてください。");
            this.setState({
                is_button : true
            })
            return;
        }


        axios({
            method: 'post',
            url: SERVER_URL+"/input_evaluate",
            withCredentials: true,
            data:{
                result_list : JSON.stringify(this.state.result_list),
                evaluate_state : JSON.stringify(this.state.evaluate_state),
                add_state : 1
            }
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                alert("確定されました。");
                this.props.history.push("/");
            }
            this.setState({
                is_button : true
            })
        }).catch(error => {
            this.setState({
                is_button : true
            })
            alert("サーバーが不安定です。");
        })
    }

    onClick_return=()=>{

        if(this.state.is_button){
            this.setState({
                is_button : false
            })
        }else{
            return;
        }

        if(this.state.evaluate_state['COMMENT'] === null || this.state.evaluate_state['COMMENT'].length < 1){
            alert("差戻す理由をコメントに書いてください。");
            this.setState({
                is_button : true
            })
            return;
        }

        axios({
            method: 'post',
            url: SERVER_URL+"/input_evaluate",
            withCredentials: true,
            data:{
                result_list : JSON.stringify(this.state.result_list),
                evaluate_state : JSON.stringify(this.state.evaluate_state),
                add_state : -1
            }
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                alert("差戻されました。");
                this.props.history.push("/");
            }
            this.setState({
                is_button : true
            })
        }).catch(error => {
            this.setState({
                is_button : true
            })
            alert("サーバーが不安定です。");
        })
    }

    render(){
        var result_list_count = -1;

        if(!this.state.page_loading){
            return(
                <Fragment></Fragment>
            );
        }

        return(
            //中央に
            <div className={cx('Evaluate', 'main_div1')}>
            <div className={cx('Evaluate', 'main_div2')}>                
                <Paper className={cx('Evaluate', 'user_paper')}>
                <Table stickyHeader  className={cx('Evaluate', 'user_info_table')}>
                    <TableHead>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="6">被評価者情報</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {
                                eval_user1.map(column => (
                                    <TableCell key={column.id} className={cx('Evaluate', 'user_info_col')}>
                                    {column.subject}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                        <TableRow>
                            {
                                eval_user1.map(column => (
                                    <TableCell key={column.id} className={cx('Evaluate', 'user_info_cell')}>
                                    {this.state.evaluate_state[column.id]}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                            <TableRow>
                            {
                                eval_user2.map(column => (
                                    <TableCell key={column.id} className={cx('Evaluate', 'user_info_col')}>
                                    {column.subject}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                        <TableRow>
                            {
                                eval_user2.map(column => (
                                    <TableCell key={column.id} className={cx('Evaluate', 'user_info_cell')}>
                                    {this.state.evaluate_state[column.id]}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                    </TableBody>
                    </Table>
                </Paper>

                <Paper className={cx('Evaluate', 'user_paper2')}>
                <Table stickyHeader  className={cx('Evaluate', 'user_info_table')}>
                    <TableHead>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="6">1次評価者情報</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {
                                eval_user3.map(column => (
                                    <TableCell key={column.first} className={cx('Evaluate', 'user_info_col')}>
                                    {column.subject}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                        <TableRow>
                            {
                                eval_user3.map(column => (
                                    <TableCell key={column.first} className={cx('Evaluate', 'user_info_cell')}>
                                    {this.state.evaluate_state[column.first]}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                            <TableRow>
                            {
                                eval_user4.map(column => (
                                    <TableCell key={column.first} className={cx('Evaluate', 'user_info_col')}>
                                    {column.subject}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                        <TableRow>
                            {
                                eval_user4.map(column => (
                                    <TableCell key={column.first} className={cx('Evaluate', 'user_info_cell')}>
                                    {this.state.evaluate_state[column.first]}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                    </TableBody>
                    </Table>
                </Paper>

                <Paper className={cx('Evaluate', 'user_paper2')}>
                <Table stickyHeader  className={cx('Evaluate', 'user_info_table')}>
                    <TableHead>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="6">2次評価者情報</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {
                                eval_user3.map(column => (
                                    <TableCell key={column.second} className={cx('Evaluate', 'user_info_col')}>
                                    {column.subject}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                        <TableRow>
                            {
                                eval_user3.map(column => (
                                    <TableCell key={column.second} className={cx('Evaluate', 'user_info_cell')}>
                                    {this.state.evaluate_state[column.second]}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                            <TableRow>
                            {
                                eval_user4.map(column => (
                                    <TableCell key={column.second} className={cx('Evaluate', 'user_info_col')}>
                                    {column.subject}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                        <TableRow>
                            {
                                eval_user4.map(column => (
                                    <TableCell key={column.second} className={cx('Evaluate', 'user_info_cell')}>
                                    {this.state.evaluate_state[column.second]}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                    </TableBody>
                    </Table>
                </Paper>
            
                <Paper className={cx('Evaluate', 'status_paper')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="6">対象日付</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell style={{textAlign : "center"}}>
                                {!this.state.evaluate_state.SEMESTER ? new Date(1997+this.state.evaluate_state.PERIOD+"/09/01").yyyymmdd() : new Date(1998+this.state.evaluate_state.PERIOD+"/03/01").yyyymmdd()}
                                <br />~<br />
                                {!this.state.evaluate_state.SEMESTER ? new Date(1998+this.state.evaluate_state.PERIOD,2,0).yyyymmdd() : new Date(1998+this.state.evaluate_state.PERIOD,8,0).yyyymmdd()}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                </Paper>

                <Paper className={cx('Evaluate', 'status_paper')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="6">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell  className={cx('Evaluate', 'status_cell')} >
                                {this.state.evaluate_state.STATUS}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                    </Table>
                </Paper>
            
               <Button variant="contained" onClick={this.onclick_logout} color="primary" className={cx('Evaluate', 'logout_button')}>Logout</Button>

               <Paper className={cx('Evaluate', 'result_paper')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="9">成果目標　-　評価 
                                <Button onClick={this.onclick_add_row} className={cx('Evaluate', 'add_row_bt')}
                                disabled={!this.state.limitation.ADD_ROW}
                                >行追加</Button>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            {
                                eval_result.map(column => (
                                    <TableCell key={column.id} className={cx('Evaluate', 'user_info_col')} style={{width : column.width+"px"}}>
                                    {column.subject}<br />{column.subject2}
                                    </TableCell>
                                ))
                            }
                        </TableRow>
                            {
                                this.state.result_list.map((row, key) => (
                                    <TableRow className={cx('Evaluate', 'input_result_row')} key={key}>
                                        <TableCell colSpan="9" className={cx('Evaluate', 'input_result_cell')}>
                                        {
                                            eval_result.map(column => {
                                                const val = column.id;
                                                return(
                                                    <TextField 
                                                    className={!this.state.limitation.result[val] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                                    value={row[val] != null ? row[val] : ""}
                                                    variant="outlined" 
                                                    multiline rows="6" 
                                                    style={!this.state.limitation.result[val] ? {width : column.width+"px"} : {width : column.width-8+"px"}} 
                                                    onChange={column.is_score ? this.onchange_result_list : this.onchange_result_comment} 
                                                    key={key+"/"+val}
                                                    name={key+"/"+val}
                                                    disabled={!this.state.limitation.result[val]}
                                                    ></TextField>
                                                )
                                            })
                                        }
                                        <br />
                                        </TableCell>
                                        </TableRow>
                                ))
                            }
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="2" style={{width:"370px"}}>合計100％になるように設定お願いします。⇒</TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >{(this.state.final_weight)+"%"}</TableCell>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="2" style={{width:"380px"}}>合計達成率</TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >{(this.state.evaluate_state.RESULT_SCORE_TOTAL+0)+"%"}</TableCell>
                            <TableCell className={cx('Evaluate', 'user_info_col')} >0~120(%)</TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >{(this.state.evaluate_state.RESULT_F_E_TOTAL+0)+"%"}</TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >{(this.state.evaluate_state.RESULT_S_E_TOTAL+0)+"%"}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="7" style={{textAlign:"right"}}>二次成果評価ランク</TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} colSpan="1" >{this.state.evaluate_state.RESULT_F_E_RANK}</TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} colSpan="1" >{this.state.evaluate_state.RESULT_S_E_RANK}</TableCell>
                        </TableRow>
                    </TableBody>
                    </Table>
                </Paper>

               <p></p>
               <Paper className={cx('Evaluate', 'result_paper')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="7">能力評価（職能発揮度評価</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} rowSpan="2" style={{width:"150px"}}>項目</TableCell>
                            <TableCell className={cx('Evaluate', 'user_info_col')} rowSpan="2" style={{width:"300px"}}>項目内容</TableCell>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="2">本人評価</TableCell>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="2">1次評価</TableCell>
                            <TableCell className={cx('Evaluate', 'user_info_col')} rowSpan="2">二次評価</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')}>評価コメント（課題、評価ポイントがある場合記入）</TableCell>
                            <TableCell className={cx('Evaluate', 'user_info_col')}>得点 (0~120)</TableCell>       
                            <TableCell className={cx('Evaluate', 'user_info_col')}>評価コメント（課題、評価ポイントがある場合記入）</TableCell>       
                            <TableCell className={cx('Evaluate', 'user_info_col')}>得点 (0~120)</TableCell>                            
                        </TableRow>
                        {
                            eval_ability.map((val, key) => (
                                <TableRow key={key}>
                                        {
                                            val.map((val2, key2) => {
                                                if(val2.text)
                                                {
                                                    return(
                                                        <TableCell className={cx('Evaluate', 'result_result')} rowSpan={val2.row} key={key2}>
                                                            <TextField
                                                            variant="outlined"
                                                            multiline rows={val2.text_row ? val2.text_row : "1"}
                                                            onChange={this.onchange_ability_list} 
                                                            key={key+"/"+val2.id}
                                                            name={key+"/"+val2.id+"/"+val2.text_row}
                                                            value={this.state.evaluate_state[val2.id] != null ? this.state.evaluate_state[val2.id] : ""}
                                                            className={!this.state.limitation.evaluate[val2.id] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                                            disabled={!this.state.limitation.evaluate[val2.id]}
                                                            >
                                                            </TextField>
                                                        </TableCell>
                                                    )
                                                }
                                                return(
                                                    <TableCell className={cx('Evaluate', 'ability_list')} rowSpan={val2.row} key={key2}>
                                                    <div className={val2.abl ? cx('Evaluate', 'ability_list_div') : cx('Evaluate', 'ability_list_div2')}>
                                                        {this.state.ability_list[val2.id]}
                                                    </div>
                                                    </TableCell>
                                                )
                                            })
                                        }
                                </TableRow>
                            ))
                        }
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="3"></TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >{(this.state.evaluate_state.AVERAGE+0)+"%"}</TableCell>
                            <TableCell className={cx('Evaluate', 'user_info_col')} >0~120(%)</TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >{(this.state.evaluate_state.F_E_AVERAGE+0)+"%"}</TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >{(this.state.evaluate_state.S_E_AVERAGE+0)+"%"}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="5" style={{textAlign:"right"}}>二次能力評価ランク</TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} colSpan="1" >{this.state.evaluate_state.EVALUATE_F_E_RANK}</TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} colSpan="1" >{this.state.evaluate_state.EVALUATE_S_E_RANK}</TableCell>
                        </TableRow>
                    </TableBody>
                    </Table>
                </Paper>
            
                <p></p>
               <Paper className={cx('Evaluate', 'result_paper')}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="3">中間面談</TableCell>    
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="3">期末面談</TableCell> 
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')}>中間面談日</TableCell>
                            <TableCell className={cx('Evaluate', 'user_info_col')}>本人コメント</TableCell>
                            <TableCell className={cx('Evaluate', 'user_info_col')}>一次評価者コメント</TableCell>  
                            <TableCell className={cx('Evaluate', 'user_info_col')}>期末面談日</TableCell>     
                            <TableCell className={cx('Evaluate', 'user_info_col')}>本人コメント</TableCell>       
                            <TableCell className={cx('Evaluate', 'user_info_col')}>一次評価者コメント</TableCell>                            
                        </TableRow>
                        <TableRow>
                            <TableCell  className={cx('Evaluate', 'result_result')} >
                                <TextField
                                variant="outlined" 
                                style={{width:"100"}}
                                multiline rows="6" 
                                name="MIDDLE_INTERVIEW_DATE"
                                onChange={this.onchange_coment}
                                className={!this.state.limitation.evaluate['MIDDLE_INTERVIEW_DATE'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                disabled={!this.state.limitation.evaluate['MIDDLE_INTERVIEW_DATE']}
                                value={this.state.evaluate_state.MIDDLE_INTERVIEW_DATE != null ? this.state.evaluate_state.MIDDLE_INTERVIEW_DATE : ""}></TextField>
                            </TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >
                                                    <TextField 
                                                    variant="outlined" 
                                                    style={{width:"315px"}}
                                                    multiline rows="6" 
                                                    name="MIDDLE_INTERVIEW_COMMENT"
                                                    onChange={this.onchange_coment}
                                                    className={!this.state.limitation.evaluate['MIDDLE_INTERVIEW_COMMENT'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                                    disabled={!this.state.limitation.evaluate['MIDDLE_INTERVIEW_COMMENT']}
                                                    value={this.state.evaluate_state.MIDDLE_INTERVIEW_COMMENT != null ? this.state.evaluate_state.MIDDLE_INTERVIEW_COMMENT : ""}></TextField>
                            </TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >
                                                    <TextField 
                                                    variant="outlined" 
                                                    style={{width:"315px"}}
                                                    multiline rows="6" 
                                                    name="M_I_EVALUATOR_COMMENT"
                                                    onChange={this.onchange_coment}
                                                    className={!this.state.limitation.evaluate['M_I_EVALUATOR_COMMENT'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                                    disabled={!this.state.limitation.evaluate['M_I_EVALUATOR_COMMENT']}
                                                    value={this.state.evaluate_state.M_I_EVALUATOR_COMMENT != null ? this.state.evaluate_state.M_I_EVALUATOR_COMMENT : ""}></TextField>
                            </TableCell>
                            <TableCell  className={cx('Evaluate', 'result_result')} >
                                <TextField
                                variant="outlined" 
                                style={{width:"100"}}
                                multiline rows="6" 
                                name="FINAL_INTERVIEW_DATE"
                                onChange={this.onchange_coment}
                                className={!this.state.limitation.evaluate['FINAL_INTERVIEW_DATE'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                disabled={!this.state.limitation.evaluate['FINAL_INTERVIEW_DATE']}
                                value={this.state.evaluate_state.FINAL_INTERVIEW_DATE != null ? this.state.evaluate_state.FINAL_INTERVIEW_DATE : ""}></TextField>
                            </TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >
                                                    <TextField 
                                                    variant="outlined" 
                                                    style={{width:"315px"}}
                                                    multiline rows="6" 
                                                    name="FINAL_INTERVIEW_COMMENT"
                                                    onChange={this.onchange_coment}
                                                    className={!this.state.limitation.evaluate['FINAL_INTERVIEW_COMMENT'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                                    disabled={!this.state.limitation.evaluate['FINAL_INTERVIEW_COMMENT']}
                                                    value={this.state.evaluate_state.FINAL_INTERVIEW_COMMENT != null ? this.state.evaluate_state.FINAL_INTERVIEW_COMMENT : ""}></TextField>
                            </TableCell>
                            <TableCell className={cx('Evaluate', 'result_result')} >
                                                    <TextField 
                                                    variant="outlined" 
                                                    style={{width:"315px"}}
                                                    multiline rows="6" 
                                                    name="F_I_EVALUATOR_COMMENT"
                                                    onChange={this.onchange_coment}
                                                    className={!this.state.limitation.evaluate['F_I_EVALUATOR_COMMENT'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                                    disabled={!this.state.limitation.evaluate['F_I_EVALUATOR_COMMENT']}
                                                    value={this.state.evaluate_state.F_I_EVALUATOR_COMMENT != null ? this.state.evaluate_state.F_I_EVALUATOR_COMMENT : ""}></TextField>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                    </Table>
                </Paper>
            
                <p></p>
               <Paper className={cx('Evaluate', 'result_paper')}>
                <Table>
                    <TableHead>
                        
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'user_info_col')} rowSpan="3">最終評価</TableCell>    
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="2">成果評価</TableCell>    
                            <TableCell className={cx('Evaluate', 'user_info_col')} colSpan="2">能力評価</TableCell> 
                        </TableRow>
                        <TableRow>  
                            <TableCell className={cx('Evaluate', 'user_info_col')} style={{width:"150px"}}>最終評価ランク</TableCell>   
                            <TableCell className={cx('Evaluate', 'user_info_col')}>最終評価コメント</TableCell>   
                            <TableCell className={cx('Evaluate', 'user_info_col')} style={{width:"150px"}}>最終評価ランク</TableCell>   
                            <TableCell className={cx('Evaluate', 'user_info_col')}>最終評価コメント</TableCell> 
                        </TableRow>
                        <TableRow>  
                            <TableCell className={cx('Evaluate', 'result_result')}>
                            <TextField 
                                variant="outlined" 
                                multiline rows="1" 
                                InputProps={{style:{fontSize:64}}}
                                name="LAST_R_EVALUATE_RANK"
                                onChange={this.onchange_coment}
                                className={!this.state.limitation.evaluate['LAST_R_EVALUATE_RANK'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                disabled={!this.state.limitation.evaluate['LAST_R_EVALUATE_RANK']}
                                value={this.state.evaluate_state.LAST_R_EVALUATE_RANK != null ? this.state.evaluate_state.LAST_R_EVALUATE_RANK : ""}
                                ></TextField>
                            </TableCell> 
                            <TableCell className={cx('Evaluate', 'result_result')}>
                            <TextField 
                                variant="outlined" 
                                style={{width:"550px"}}
                                multiline rows="4" 
                                name="LAST_R_EVALUATE_COMMENT"
                                onChange={this.onchange_coment}
                                className={!this.state.limitation.evaluate['LAST_R_EVALUATE_COMMENT'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                disabled={!this.state.limitation.evaluate['LAST_R_EVALUATE_COMMENT']}
                                value={this.state.evaluate_state.LAST_R_EVALUATE_COMMENT != null ? this.state.evaluate_state.LAST_R_EVALUATE_COMMENT : ""}
                                ></TextField>
                            </TableCell> 
                            <TableCell className={cx('Evaluate', 'result_result')}>
                            <TextField 
                                variant="outlined" 
                                multiline rows="1" 
                                name="LAST_A_EVALUATE_RANK"
                                onChange={this.onchange_coment}
                                InputProps={{style:{fontSize:64}}}
                                className={!this.state.limitation.evaluate['LAST_A_EVALUATE_RANK'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                disabled={!this.state.limitation.evaluate['LAST_A_EVALUATE_RANK']}
                                value={this.state.evaluate_state.LAST_A_EVALUATE_RANK != null ? this.state.evaluate_state.LAST_A_EVALUATE_RANK : ""}
                                ></TextField>
                            </TableCell> 
                            <TableCell className={cx('Evaluate', 'result_result')}>
                            <TextField 
                                variant="outlined" 
                                style={{width:"550px"}}
                                multiline rows="4" 
                                name="LAST_A_EVALUATE_COMMENT"
                                onChange={this.onchange_coment}
                                className={!this.state.limitation.evaluate['LAST_A_EVALUATE_COMMENT'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                disabled={!this.state.limitation.evaluate['LAST_A_EVALUATE_COMMENT']}
                                value={this.state.evaluate_state.LAST_A_EVALUATE_COMMENT != null ? this.state.evaluate_state.LAST_A_EVALUATE_COMMENT : ""}
                                ></TextField>
                            </TableCell> 
                        </TableRow>
                    </TableBody>
                    </Table>
                </Paper>
            
                <p></p>
                <Paper className={cx('Evaluate', 'feedback_paper')}>
                <Table>
                    <TableHead></TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell className={cx('Evaluate', 'feedback_col')}>評価者コメント</TableCell>  
                            <TableCell className={cx('Evaluate', 'result_result')}>
                                <TextField 
                                    variant="outlined" 
                                    style={{width:"100%"}}
                                    multiline rows="2" 
                                    name="COMMENT"
                                    InputProps={{style:{color:"red"}}}
                                    onChange={this.onchange_coment}
                                    className={!this.state.limitation.evaluate['COMMENT'] ? cx('Evaluate', 'disabled') : cx('Evaluate', 'textfield')}
                                    disabled={!this.state.limitation.evaluate['COMMENT']}
                                    placeholder={this.state.evaluate_state.COMMENT != null ? "" : "このコメントで前任者にメールが届きます。"}
                                    value={this.state.evaluate_state.COMMENT != null ? this.state.evaluate_state.COMMENT : ""}
                                    ></TextField>    
                            </TableCell>    
                        </TableRow>
                    </TableBody>
                    </Table>
                </Paper>

                <Link className={cx('Login', 'link')} to="/"><Button variant="contained" color="primary" className={cx('Evaluate', 'bottom_button')}>戻る</Button></Link>
                { this.state.limitation.RETURN ? <Button variant="contained" color="primary" className={cx('Evaluate', 'bottom_button')} onClick={this.onClick_return}>差戻し</Button> : null }
                { this.state.limitation.SUBMIT ? <Button variant="contained" color="primary" className={cx('Evaluate', 'bottom_button')} onClick={this.onClick_submit}>確定</Button> : null }
                { this.state.limitation.SAVE ? <Button variant="contained" color="primary" className={cx('Evaluate', 'bottom_button')} onClick={this.input_evaluate}>一時保存</Button> : null }
            </div>
            </div>
        );
    }
}


export default Evaluate;
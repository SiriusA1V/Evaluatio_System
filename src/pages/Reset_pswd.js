import React, { Component, Fragment} from 'react';
import classNames from 'classnames/bind';
import styles from '../css/Styles.scss';
import {Input, Button, Paper, TextField} from '@material-ui/core';
import axios from 'axios';
import * as constants from '../const/constants';
import { Link } from 'react-router-dom';
import { tsConstructorType } from '@babel/types';
import { userInfo } from 'os';

const SERVER_URL = constants.SERVER_URL;
const REACT_URL = constants.REACT_URL;
const cx = classNames.bind(styles);

class Reset_pswd extends Component{
    state = {
        id : "",
        pswd: "",
        repswd: "",
        text: "",
        page_loading : false,
        mail_info : ""
    }

    constructor(props){
        super(props)
        this.state.mail_info = props.match.params.mail_info;
    }
    
    componentDidMount(){        
        axios({
            method: 'post',
            url: SERVER_URL+"/get_reset_id",
            withCredentials: true,
            data:{
                mail_info : this.state.mail_info
            }
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                this.setState({
                    page_loading : true,
                    id : response.data.user_id
                })
            }
        }).catch(error => {
            alert("サーバーからの応答がありません。");
            this.props.history.push({pathname : '/'});
        })
        
    }

    onchange_text = (e) => {
        this.setState({
            [e.target.name] : e.target.value
        })
    }

    //ログインイベント作成
    onclick_reset_pswd = () =>{
        if(this.state.pswd === this.state.repswd && this.state.pswd.length > 6){
            axios({
                method: 'post',
                url: SERVER_URL+"/reset_pswd",
                withCredentials: true,
                data:{
                    id : this.state.id,
                    pswd : this.state.pswd
                }
            }).then(response => {
                if(response.data.err != null){
                    alert("パスワード変更に問題が発生しました。");
                }else{
                    alert("パスワード変更されました。");
                    this.props.history.push({pathname : '/login'});
                }
            }).catch(error => {
                alert("サーバーからの応答がありません。");
            })
        }else{
            alert("パスワードを確認してください。");
        }
    }
    
    render(){
        if(this.state.page_loading){
            return (
                <Fragment>
                    <div className={cx('Login', 'main_div')}>
                        Reset Password
                    </div>
                    <div className={cx('Login', 'main_div2')}>
                        <div>
                            <TextField label="ID" InputProps={{readOnly:true}} className={cx('Login', 'input')} defaultValue={this.state.id}></TextField>
                            <br></br><br></br><br></br>
                            <Input placeholder="New Password" className={cx('Login', 'input')} type="password" name="pswd" onChange={this.onchange_text} value={this.state.pswd}></Input>
                            <br></br><br></br><br></br>
                            <Input placeholder="Re Password" className={cx('Login', 'input')} type="password" name="repswd" onChange={this.onchange_text} value={this.state.repswd}></Input>
                            <br></br><br></br><br></br>
                            <Button variant="contained" className={cx('Reset_pswd', 'button1')} onClick={this.onclick_reset_pswd}>設 定</Button>&nbsp;&nbsp;&nbsp;
                        </div>
                    </div>
                </Fragment>
            );
        }else{
            return (  <Fragment></Fragment> );
        }
    }
}

export default Reset_pswd;
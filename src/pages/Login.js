import React, { Component, Fragment} from 'react';
import classNames from 'classnames/bind';
import styles from '../css/Styles.scss';
import {Input, Button, Paper} from '@material-ui/core';
import axios from 'axios';
import * as constants from '../const/constants';
import { Link } from 'react-router-dom';

const SERVER_URL = constants.SERVER_URL;
const REACT_URL = constants.REACT_URL;
const cx = classNames.bind(styles);

class Login extends Component{
    state = {
        id: "",
        pswd: "",
        text: "",
        is_login : false,
        is_button : true
    }

    componentDidMount(){
        axios({
            method: 'post',
            url: SERVER_URL+"/get_admin_message",
            withCredentials: true,
        }).then(response => {
           if(response.data === true){
            this.props.history.push("/");
           }else{
                this.setState({
                    text : response.data.ADMIN_COMMENT,
                    is_login : true
               });
           }
        }).catch(error => {
            this.setState({
                text : "err"
            });
        })
    }

    onchange_text = (e) => {
        this.setState({
            [e.target.name] : e.target.value
        })
    }

    //ログインイベント作成
    onclick_login = () =>{

        if(this.state.is_button){
            this.setState({
                is_button : false
            })
        }else{
            return;
        }

        if(this.state.id.length === 0 || this.state.pswd.length === 0){
            alert("情報をいれてください。")
        }else{
            axios({
                method: 'post',
                url: SERVER_URL+"/login",
                withCredentials: true,
                data:{
                    id : this.state.id,
                    password : this.state.pswd
                }
            }).then(response => {
                if(response.data){
                    this.props.history.push("/");
                }else{
                    alert("IDやパスワードが違います。");
                }
                this.setState({
                    is_button : true
                })
            }).catch(error => {
                alert("サーバーとの連結が不安定です。")
                this.setState({
                    is_button : true
                })
            })
        }
    }
    
    render(){
        if(this.state.is_login){
            return (
                <Fragment>
                    <div className={cx('Login', 'main_div')}>
                        Login
                    </div>
                    <div className={cx('Login', 'main_div2')}>
                        <div>
                            <Input placeholder="ID" className={cx('Login', 'input')} name="id" onChange={this.onchange_text} value={this.state.id}></Input>
                            <br></br><br></br><br></br>
                            <Input placeholder="Password" className={cx('Login', 'input')} type="password" name="pswd" onChange={this.onchange_text} value={this.state.pswd}></Input>
                            <br></br><br></br><br></br>
                            <Button variant="contained" className={cx('Login', 'button1')} onClick={this.onclick_login}>ログイン</Button>&nbsp;&nbsp;&nbsp;
                            <Link className={cx('Login', 'link')} to={{pathname : '/set_pswd'}}><Button variant="contained" className={cx('Login', 'button2')} >パスワードリセット</Button></Link>
                        </div>
                        <div>
                            <Paper className={cx('Login', 'paper')}> {(this.state.text).split('\n').map((line, key)=>{return (<span key={key}>{line}<br/></span>)})} </Paper>
                        </div>
                    </div>
                </Fragment>
            );
        }else{
            return(<Fragment></Fragment>)
        }
    }
}

export default Login;
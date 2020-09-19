import React, { Component, Fragment} from 'react';
import classNames from 'classnames/bind';
import styles from '../css/Styles.scss';
import {Input, Button, Paper} from '@material-ui/core';
import axios from 'axios';
import * as constants from '../const/constants';
import {Link} from 'react-router-dom';

const SERVER_URL = constants.SERVER_URL;
const REACT_URL = constants.REACT_URL;
const cx = classNames.bind(styles);

class Set_pswd extends Component{
    state = {
        button_event : true,
        id: "",
    }

    onchange_text = (e) => {
        this.setState({
            [e.target.name] : e.target.value
        })
    }

    //reset_passwordベント作成
    set_password = () =>{
        if(this.state.id.length < 6){
            alert("IDの形ではありません。");            
        }else if(this.state.button_event){

            this.setState({
                button_event : false
            })

            axios({
                method: 'post',
                url: SERVER_URL+"/send_mail",
                withCredentials: true,
                data:{
                    id : this.state.id
                }
            }).then(response => {
                this.setState({
                    button_event : true
                })
                if(response.data.err != null){
                    alert(response.data.err);
                }else{
                    alert("メールを送信しました。ブラウザを閉じないでください。");
                }
            }).catch(error => {
                this.setState({
                    button_event : true
                })
                alert("server 送信に失敗しました。");            
            })
        }
    }
    
    render(){
        return (
            <Fragment>
                <div className={cx('Login', 'main_div')}>
                    Reset Password
                </div>
                <div className={cx('Login', 'main_div2')}>
                    <div>
                        <Input placeholder="ID" className={cx('Login', 'input')} name="id" onChange={this.onchange_text} value={this.state.id}></Input>
                        <br></br><br></br><br></br>
                        <Link className={cx('Login', 'link')} to={{pathname : '/login'}}><Button variant="contained" className={cx('Set_pswd', 'button2')} >キャンセル</Button></Link>&nbsp;&nbsp;&nbsp;
                        <Button variant="contained" className={cx('Set_pswd', 'button1')} onClick={this.set_password}>メール送信</Button>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default Set_pswd;
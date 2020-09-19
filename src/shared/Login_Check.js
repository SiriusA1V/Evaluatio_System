import React, { Component, Fragment} from 'react';
import axios from 'axios';
import cookie from 'react-cookies';
import {Login, Set_pswd} from '../pages';
import RouteComp from './Route_Comp';
import * as Constants from '../const/constants';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const SERVER_URL = Constants.SERVER_URL;
const REACT_URL = Constants.REACT_URL;

class Login_Check extends Component{
    state = {
        loading : false
    }

    componentDidMount(){     
        var param = window.location.href.replace(REACT_URL, "");

        if(param !== "/login" && param !== "/login/" && param !== "/set_pswd" && param.substring(0,11) !== "/reset_pswd"){

//        var date = new Date().setHours(2);
//        cookie.save('userId', "name", {path : '/'});
//        cookie.save('userpsw', "password", {path : '/'});
//クッキーを確認してから
//axios内容修正する必要あり
            axios({
                method: 'post',
                url: SERVER_URL+"/login_check",
                withCredentials: true,
            }).then(response => {
                if(response.data){                    
                    this.setState({
                        loading : true
                    })
                }else{
                    window.location.assign("/login");
                }
            }).catch(error => {
            })
        }else{
            this.setState({
                loading : true
            })
        }
    }

    render(match){
        return(
            <Fragment>
                {this.state.loading ? <RouteComp /> : ""}
            </Fragment>
        );
    };
} 


export default Login_Check;
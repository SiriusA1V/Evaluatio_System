import React, { Component, Fragment} from 'react';
import classNames from 'classnames/bind';
import styles from '../css/Styles.scss';
import * as constants from '../const/constants';
import axios from 'axios';
import {KeyboardArrowLeft, KeyboardArrowRight} from '@material-ui/icons';
import { IconButton , TextField, Button, Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';

const SERVER_URL = constants.SERVER_URL;
const REACT_URL = constants.REACT_URL;
const cx = classNames.bind(styles);
const LIST_COL = constants.LIST_COL3;

class Import_User_info extends Component{
    state = {
        insert_info : [],
        is_button : true
    }

    onClickHandle = (event) => {
        var input = event.target;
        var save_arr = new Object();
        var reader = new FileReader();
        var alert_num = 0;
  
        if(input.files[0] !== undefined){
          reader.readAsText(input.files[0], "Shift_JIS");
  
          reader.onload = () => {
            
            save_arr = (reader.result.replace(/(\r?\r)/gm, '')).split('\n');
    
            for(var i = 0; i < save_arr.length; i++){
              save_arr[i] = save_arr[i].split('\t');
    
              if(i !== save_arr.length-1 && save_arr[i].length !== 16){
                alert_num = 1;
              }
              if(save_arr[i].length === 16 && save_arr[i][0].length === 0){
                alert_num = 1;
              }
            }
  
            if(save_arr[0][0] !== "所属" || save_arr[0][1] !== "ID" || save_arr[0][2] !== "パスワード" || save_arr[0][3] !== "氏名"){
              alert_num += 2;
            }
            if(save_arr[save_arr.length-1].length !== 16 && save_arr[save_arr.length-1].length !== 1){
              alert_num += 4;
            }
  
            if(alert_num === 1){
              alert("セルの数が正しくありません。または、入力した情報の中にタブや改行が入ってる恐れがあります。");
            }else if(alert_num === 2){
              alert("ヘッダがないか正しくありません。");     
            }else if(alert_num === 3){
              alert("セルの数が正しくありません。または、入力した情報の中にタブや改行が入ってる恐れがあります。ヘッダがないか正しくありません。"); 
            }else if(alert_num === 4){
              alert("最後の列の情報が正しくありません。");
            }else if(alert_num === 5){
              alert("セルの数が正しくありません。または、入力した情報の中にタブや改行が入ってる恐れがあります。最後の列の情報が正しくありません。");
            }else if(alert_num === 6){
              alert("ヘッダがないか正しくありません。最後の列の情報が正しくありません。");               
            }else if(alert_num >= 7){
              alert("ファイルの内容が間違っています。");               
            }

            save_arr.shift();
            if(save_arr[save_arr.length-1].length !== 16){
                save_arr.pop();
            }

            if(alert_num === 0){
                this.setState({
                    insert_info : save_arr
                })
            }else{
                this.setState({
                    insert_info : []
                })
            }
          };
        }else{
            this.setState({
                insert_info : []
            })
        }
    }

    onClick_submit=()=>{

        if(this.state.is_button){
            this.setState({
                is_button : false
            })
        }else{
            return;
        }

        if(this.state.insert_info.length === 0){
            alert("情報がありません。");
            return;
        }

        axios({
            method: 'post',
            url: SERVER_URL+"/insert_user_info",
            withCredentials: true,
            data:{
                insert_info : JSON.stringify(this.state.insert_info)
            }
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                alert("登録完了");

                this.props.success_update();
            }
            this.setState({
                is_button : true
            })
        }).catch(error => {
            this.setState({
                is_button : true
            })
        })  
    }

    render(){
        return(
              <Fragment>
                  <div className={cx('List', 'tableWrapper')}>
                  <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {
                                LIST_COL.map((val, key) => {
                                    return(
                                        <TableCell key={key}>
                                            {val.subject}
                                        </TableCell>
                                    )
                                })
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            this.state.insert_info.map((val, key) => {
                                return(
                                    <TableRow key={key}>
                                        {
                                            val.map((val2, key2) => {
                                                return(
                                                    <TableCell key={key2}>
                                                    {val2}
                                                    </TableCell>
                                                )
                                            })
                                        }
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                    </Table>
                  </div>
                  
                  <div>
                    <input style={{margin:"5px"}} id="ip_file" type='file' accept='text/plain' onChange={this.onClickHandle}/>
                    <button style={{float:"right", margin:"7px"}} onClick={this.props.onClick_cancel}>CANCEL</button>
                    <button style={{float:"right", margin:"7px"}} onClick={this.onClick_submit}>SUBMIT</button>
                  </div>
              </Fragment> 
        );
    }
}

export default Import_User_info;
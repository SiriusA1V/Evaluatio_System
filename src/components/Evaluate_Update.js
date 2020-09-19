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

class Evaluate_Update extends Component{
    state = {
        is_button : true,
        router : this.props.router,
        set_update_info : this.props.set_update_info,
        page : 0
    }

    onclick_page_bt=(e)=>{

        if(""+e === "next_page" && parseInt(this.state.page) < (this.state.set_update_info.length-1)){
            this.setState({
                page : (parseInt(this.state.page) + 1)
            })
        }else if(""+e ==="previous_page" && parseInt(this.state.page) > 0){
            this.setState({
                page : (parseInt(this.state.page) - 1)
            })
        }
    }

    onchange_handle=(e)=>{
        this.setState({
            set_update_info : this.state.set_update_info.map(
                (info, key) => ""+key === e.target.name.split("/")[0]
                ? ({...info, [e.target.name.split("/")[1]] : e.target.value})
                : info
            )
        })
    }

    //次はここから
    onclick_update_bt=()=>{

        if(this.state.is_button){
            this.setState({
                is_button : false
            })
        }else{
            return;
        }

        var router = "";
        if(""+this.state.router === "evaluate"){
            router = "/update_evaluate";
        }else{
            router = "/update_user_info"
        }

        axios({
            method: 'post',
            url: SERVER_URL+router,
            withCredentials: true,
            data:{
                update_info : JSON.stringify(this.state.set_update_info)
            }
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                alert("変更完了");

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
        var list_col = ""+this.state.router === "evaluate" ? constants.LIST_COL2 : constants.LIST_COL3;

        return(
              <Fragment>
                  <Table stickyHeader  className={cx('Evaluate', 'user_info_table')}>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan="2" style={{backgroundColor:"silver"}}>
                                <IconButton size="small" onClick={()=>this.onclick_page_bt("previous_page")}>
                                    <KeyboardArrowLeft />
                                </IconButton >
                                <IconButton size="small" onClick={()=>this.onclick_page_bt("next_page")}>
                                    <KeyboardArrowRight />
                                </IconButton >
                                <div style={{float:"left", marginRight:"5%", marginTop:"6px", color:"black"}}>
                                    {parseInt(this.state.page)+1} of {this.state.set_update_info.length}
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {                            
                            list_col.map((val, key) => {
                                var indx = this.state.page;
                                return(
                                    <TableRow key={key}>
                                        <TableCell>{val.subject}</TableCell>
                                        <TableCell>
                                            <TextField
                                            id="outlined-margin-dense"
                                            margin="dense"
                                            variant="outlined"
                                            onChange={this.onchange_handle}
                                            name={indx + "/" + val.id}
                                            value={this.state.set_update_info[indx][val.id] === null ? "" : this.state.set_update_info[indx][val.id]}
                                            style={{margin:"-7px"}}
                                            >
                                            </TextField>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        }

                    </TableBody>
                    </Table>
                    <div>
                        <Button style={{width : "50%", color:"#0021cb"}} onClick={()=>this.props.onClick_cancel()}>CANCEL</Button>
                        <Button style={{width : "50%", color:"#0021cb"}} onClick={this.onclick_update_bt}>ALL_UPDATE</Button>
                    </div>                    
              </Fragment> 
        );
    }
}

export default Evaluate_Update;
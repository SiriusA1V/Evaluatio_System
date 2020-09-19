import React, { Component, Fragment} from 'react';
import classNames from 'classnames/bind';
import styles from '../css/Styles.scss';
import * as constants from '../const/constants';
import axios from 'axios';
import { Checkbox, Select, MenuItem, Input, Button, Paper, Table, TableBody, TableCell, TableHead, TablePagination, TableRow} from '@material-ui/core';
import { FormControl, InputLabel,ListItemText, TextField ,Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'; 
import SearchIcon from '@material-ui/icons/Search';
import { Link } from 'react-router-dom';
import EvaluateUpdate from '../components/Evaluate_Update';
import ImportUserInfo from '../components/Import_User_Info';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

const SERVER_URL = constants.SERVER_URL;
const REACT_URL = constants.REACT_URL;
const cx = classNames.bind(styles);
const columns = constants.LIST_COL3;

class User_info extends Component{
    state = {
        page : 0,
        rowsPerPage : 10,
        select : "id",
        all_check : false,
        search : "",
        is_admin : false,
        is_setStatus : false,
        is_setSemester : false,
        is_sendMail : false,
        is_update : false,
        is_import : false,
        is_button : true,
        set_update_info : [],
        
        search_checked : {
            past : false,
            semester0 : false,
            semester1 : false,
        },

        checked : {},
        user_info : [],
        search_params : {} 
    }

    componentDidMount(){
        var save_target_id = new Object();

        axios({
            method: 'post',
            url: SERVER_URL+"/get_user_list",
            withCredentials: true,
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
                this.props.history.push({pathname : '/'});
            }else{

                response.data.user_info.map(val => {
                    save_target_id[val.ID] = false
                })
                
                this.setState({
                    is_admin : true,
                    user_info : response.data.user_info,
                    checked : save_target_id
                })
            }
        }).catch(error => {
            alert("サーバーからの応答がありません。");
            this.props.history.push({pathname : '/'});
        })
    }

    handleChangePage = (event, newPage) =>{
        this.setState({
            page : newPage
        })
    }

    handleChangeRowsPerPage = (event) =>{
        this.setState({
            rowsPerPage : event.target.value,
            page : 0
        })
    }

    select_checked=(e)=>{        
        if(e.target.name === "all_check"){
            var save = new Object();
            Object.keys(this.state.checked).map(val => {save[val]=!this.state.all_check})
            
            this.setState({
                all_check : !this.state.all_check,
                checked : save
            })
            return
        }

        if(this.state.all_check){
            this.setState({
                all_check : !this.state.all_check,
                checked : {
                    ...this.state.checked,
                    [e.target.name] : !this.state.checked[e.target.name]
                }
            })
        }else{
            this.setState({
                checked : {
                    ...this.state.checked,
                    [e.target.name] : !this.state.checked[e.target.name]
                }
            })
        }
    }

    handleChange = e => {
        this.setState({
            [e.target.name] : e.target.value
        })
    };

    onClick_cancel=()=>{
        this.setState({
            is_update : false,
            is_import : false,
        })
    }

    search_enter = e => {
        if(e.keyCode === 13){

            if(this.state.is_button){
                this.setState({
                    is_button : false
                })
            }else{
                return;
            }

            axios({
                method: 'post',
                url: SERVER_URL+"/search_user_info",
                withCredentials: true,
                data:{
                    select : this.state.select,
                    search : this.state.search
                }
            }).then(response => {
                if(response.data.err != null){
                    alert(response.data.err);
                }else{
                    var save_target_id = new Object();

                    response.data.user_info.map(val => {
                        save_target_id[val.ID] = false
                    })


                    this.setState({
                        user_info : response.data.user_info,
                        checked : save_target_id,
                        all_check : false,
                        
                        search_params : {
                            search_checked : JSON.stringify(this.state.search_checked),
                            select : this.state.select,
                            search : this.state.search
                        }
                    })
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
    }

    set_evaluate = () =>{
        var count = 0;
        var save_info = new Array();
        
        Object.keys(this.state.checked).map((val) => {
            if(this.state.checked[val]){                
                this.state.user_info.map(val2=>{
                    if(""+val2.ID === ""+val){
                        save_info.push(val2);
                    }
                })
            }
        })
        
        if(save_info.length === 0){
            alert("編集する対象を選択してください。");
            return;
        }        

        this.setState({
            set_update_info : save_info,
            is_update : true
        })
    }

    success_update=()=>{
        this.onClick_cancel();
        
        axios({
            method: 'post',
            url: SERVER_URL+"/search_user_info",
            withCredentials: true,
            data: this.state.search_params,
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                var save_target_id = new Object();
                
                response.data.user_info.map(val => {
                    save_target_id[val.ID] = false
                })

                this.setState({
                    user_info : response.data.user_info,
                    checked : save_target_id,
                    all_check : false
                })
            }
        }).catch(error => {
        })
    }

    export = () =>{
        var csvData = new Array();

        this.state.user_info.map((row, key) => {
            csvData[key] = new Object();

            columns.map(column => {
                csvData[key][column.subject] = row[column.id];
            })
        })
        
        var fileName = "人事評価ユーザー情報.xlsx";
        var fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        var ws = XLSX.utils.json_to_sheet(csvData);
        var wb = { Sheets: { 'ユーザー情報': ws }, SheetNames: ['ユーザー情報'] };
        var excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        var data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName);
    }

    click_import=(e)=>{
        this.setState({
            is_import : true
        })
    }

    render(){
        if(!this.state.is_admin){
            return(<Fragment></Fragment>)
        }

        return(
            <div className={cx('List', 'root_div')}>
                <div className={cx('List', 'main_div')}>
                    <Link className={cx('Login', 'link')} style={{color:"white"}} to="/"><Button color="inherit" className={cx('List', 'button1')}>戻る</Button></Link>
                </div>

                <Paper className={cx('List', 'root')}>
                <div className={cx('List', 'tableWrapper')}>
                    <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                        <TableCell><Checkbox style={{padding:"0"}} color="primary" name="all_check" onChange={this.select_checked} checked={this.state.all_check}></Checkbox></TableCell>
                        {columns.map(column => (
                            <TableCell key={column.id}>
                            {column.subject}
                            </TableCell>
                        ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.user_info.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage).map(row => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.ID}>
                                <TableCell><Checkbox style={{padding:"0"}} color="primary" name={""+row.ID} onChange={this.select_checked} checked={this.state.checked[row.ID]}></Checkbox></TableCell>
                                {columns.map(column => {
                                    const value = row[column.id];
                                    return (
                                    <TableCell key={column.id}>
                                        {value}
                                    </TableCell>
                                    );
                                })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                    </Table>
                </div>
                <div className={cx('List', 'sort_div')}>

                    <Select
                        className={cx('List', 'select')} 
                        style={{marginLeft:"28%"}}
                        value={this.state.select}
                        onChange={this.handleChange}
                        name="select"
                    >
                    <MenuItem value={"id"}>ID</MenuItem>
                    <MenuItem value={"name"}>氏名</MenuItem>
                    <MenuItem value={"head_office"}>本部</MenuItem>
                    <MenuItem value={"office"}>部</MenuItem>
                    </Select>
                    <SearchIcon className={cx('List', 'searchicon')} />
                    <Input placeholder="Search" className={cx('List', 'search_input')} name="search" value={this.state.search} onChange={this.handleChange} onKeyDown={this.search_enter}></Input>                
                    <TablePagination
                        className={cx('List', 'TablePagination')}
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={this.state.user_info.length}
                        rowsPerPage={this.state.rowsPerPage}
                        page={this.state.page}
                        backIconButtonProps={{
                        'aria-label': 'previous page',
                        }}
                        nextIconButtonProps={{
                        'aria-label': 'next page',
                        }}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                </div>
                </Paper>
                <div className={cx('List', 'navi_div')}>
                <Button variant="outlined" className={cx('List', 'navi_button')} onClick={this.set_evaluate}>編集</Button>
                    <Button variant="outlined" className={cx('List', 'navi_button')} onClick={this.click_import}>インポート</Button>
                    <Button variant="outlined" className={cx('List', 'navi_button')}　onClick={this.export}>エクスポート</Button>
                </div>

                <Dialog
                    open={this.state.is_update}
                    onClose={this.onClick_cancel}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <EvaluateUpdate set_update_info={this.state.set_update_info} success_update={this.success_update} onClick_cancel={this.onClick_cancel} router={"user_info"}></EvaluateUpdate>
                </Dialog>

                <Dialog
                    open={this.state.is_import}
                    onClose={this.onClick_cancel}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <ImportUserInfo onClick_cancel={this.onClick_cancel} success_update={this.success_update}></ImportUserInfo>
                </Dialog>
            </div>
        );
    }
}

export default User_info;
import React, { Component, Fragment} from 'react';
import classNames from 'classnames/bind';
import styles from '../css/Styles.scss';
import { Checkbox, Select, MenuItem, Input, Button, Paper, Table, TableBody, TableCell, TableHead, TablePagination, TableRow} from '@material-ui/core';
import { FormControl, InputLabel,ListItemText, TextField ,Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'; 
import SearchIcon from '@material-ui/icons/Search';
import axios from 'axios';
import * as constants from '../const/constants';
import { Link } from 'react-router-dom';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { tsImportEqualsDeclaration } from '@babel/types';
import { array } from 'prop-types';
import EvaluateUpdate from '../components/Evaluate_Update'
import ImportEvaluate from '../components/Import_Evaluate'

const SERVER_URL = constants.SERVER_URL;
const REACT_URL = constants.REACT_URL;
const cx = classNames.bind(styles);

var columns = constants.LIST_COL;

class List extends Component{
    state = {
        evaluate_id : undefined,
        page : 0,
        rowsPerPage : 10,
        page_loading : false,
        select : "period",
        all_check : false,
        search : "",
        is_admin : "",
        is_setStatus : false,
        is_setSemester : false,
        is_adminMSG : false,
        is_sendMail : false,
        is_update : false,
        is_import : false,
        is_button : true,
        adminMSG : "",
        set_update_info : [],

        
        search_checked : {
            past : false,
            semester0 : false,
            semester1 : false,
            is_shop0 : false,
            iu_shop1 : false,
        },

        checked : {},
        user_info : {},
        target_info : []
    };

    componentDidMount(){
        var save_target_id = new Object();

        axios({
            method: 'post',
            url: SERVER_URL+"/get_early_list",
            withCredentials: true,
            data:{
            }
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                if(""+response.data.grade === "G7" || ""+response.data.position === "本部長" || ""+response.data.is_admin === "1"){
                    columns=constants.LIST_COL2;
                }

                response.data.early_list.map(val => {
                    save_target_id[val.ID] = false
                })

                this.setState({
                    user_info : response.data.user_info,
                    target_info : response.data.early_list,
                    page_loading : true,
                    is_admin : response.data.is_admin,
                    evaluate_id : response.data.user_evaluate,
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

    onclick_logout = () =>{
        axios({
            method: 'post',
            url: SERVER_URL+"/logout",
            withCredentials: true,
            data:{
            }
        }).then(response => {
            if(response.data){
                window.location.assign("/");
            }else{
                alert("ログアウトするとき問題が発生しました。");
            }
        }).catch(error => {
        })
    }

    handleChange = e => {
        this.setState({
            [e.target.name] : e.target.value
        })
    };

    check_handleChange = e => {
        this.setState({
            search_checked : {
                ...this.state.search_checked,
                [e.target.name] : !this.state.search_checked[e.target.name]
            }
        })
    };

    search_enter = (e) => {
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
                url: SERVER_URL+"/search",
                withCredentials: true,
                data:{
                    search_checked : JSON.stringify(this.state.search_checked),
                    select : this.state.select,
                    search : this.state.search
                }
            }).then(response => {
                if(response.data.err != null){
                    alert(response.data.err);
                }else{
                    var save_target_id = new Object();
                    
                    response.data.early_list.map(val => {
                        save_target_id[val.ID] = false
                    })

                    this.setState({
                        target_info : response.data.early_list,
                        checked : save_target_id,
                        all_check : false,
                        /*
                        search_params : {
                            search_checked : JSON.stringify(this.state.search_checked),
                            select : this.state.select,
                            search : this.state.search
                        }
                        */
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

    //65~83
    export = () =>{
        var csvData = new Array();

        this.state.target_info.map((row, key) => {
            csvData[key] = new Object();

            columns.map(column => {
                csvData[key][column.subject] = row[column.id];
            })
        })
        
        var fileName = "人事評価サマリー.xlsx";
        var fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        var ws = XLSX.utils.json_to_sheet(csvData);
        var wb = { Sheets: { '人事評価サマリー': ws }, SheetNames: ['人事評価サマリー'] };
        var excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        var data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName);
    }

    onclick_list = (val) =>{
        if(""+val === ""+null){
            alert("評価シートを呼び出す際にエラーが発生しました。");
            return;
        }
        this.props.history.push({pathname : '/evaluate', state:{evaluate_id : val}});
    }

    set_status = () =>{
        this.setState({
            is_setStatus : false
        })

        axios({
            method: 'post',
            url: SERVER_URL+"/set_status",
            withCredentials: true,
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                alert("ステータス変更完了");
            }
        }).catch(error => {
        })
    }

    set_Semester = () =>{
        this.setState({
            is_setSemester : false
        })

        axios({
            method: 'post',
            url: SERVER_URL+"/set_Semester",
            withCredentials: true,
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                alert("評価開始");
            }
        }).catch(error => {
        })
    }

    set_adminMSG = () =>{
        this.setState({
            is_adminMSG : false
        })

        axios({
            method: 'post',
            url: SERVER_URL+"/set_adminMSG",
            withCredentials: true,
            data:{
                adminMSG : this.state.adminMSG
            }
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                alert("管理者メッセージ変更完了");
            }
        }).catch(error => {
        })
    }

    onClick_call_alert=(e)=>{        
        this.setState({
            [e] : true
        })
    }

    onClick_cancel=()=>{
        this.setState({
            is_adminMSG : false,
            is_setStatus : false,
            is_sendMail : false,
            is_setSemester : false,
            is_update : false,
            is_import : false,
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

    send_status=(e)=>{
        var have_true = new Object;

        if(this.state.is_button){
            this.setState({
                is_buttion : false
            })
        }else{
            return;
        }

        Object.keys(this.state.checked).map(val => {
            if(this.state.checked[val]){
                have_true[val] = true;
            }
        })

        if(Object.keys(have_true).length === 0){
            alert("送る情報がありません。");
            return;
        }

        axios({
            method: 'post',
            url: SERVER_URL+"/send_status",
            withCredentials: true,
            data:{
                checked : JSON.stringify(have_true)
            }
        }).then(response => {
            if(response.data.err != null){
                //メールを送る際に誰のメールにエラーが走ったかアラート
                alert(response.data.err);
            }else{
                alert("リマインダー完了");
                
                this.setState({
                    is_sendMail : false
                })
            }
            this.setState({
                is_buttion : true
            })
        }).catch(error => {
            this.setState({
                is_buttion : true
            })
        })    
    }

    set_evaluate = () =>{
        var count = 0;
        var save_info = new Array();
        
        Object.keys(this.state.checked).map((val) => {
            if(this.state.checked[val]){                
                this.state.target_info.map(val2=>{
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
        
        this.componentDidMount();
        /*
        axios({
            method: 'post',
            url: SERVER_URL+"/search",
            withCredentials: true,
            params: this.state.search_params,
        }).then(response => {
            if(response.data.err != null){
                alert(response.data.err);
            }else{
                var save_target_id = new Object();
                
                response.data.early_list.map(val => {
                    save_target_id[val.ID] = false
                })

                this.setState({
                    target_info : response.data.early_list,
                    checked : save_target_id,
                    all_check : false
                })
            }
        }).catch(error => {
        })
        */
    }

    goto_user_list = () => {
        this.props.history.push({pathname : '/user_info'});
    }
        
    render(){
        if(!this.state.page_loading){
            return(<Fragment />)
        }
        return(
            <div className={cx('List', 'root_div')}>
                <div className={cx('List', 'main_div')}>
                    <table className={cx('List', 'user_table')}>
                        <tbody className={cx('List', 'tbody')}>
                            <tr><td>{this.state.user_info.ID}</td><td>{this.state.user_info.NAME}</td><td>{this.state.user_info.HEAD_OFFICE}</td><td>{this.state.user_info.OFFICE}</td></tr>
                            <tr><td>{this.state.user_info.GRADE}</td><td>{this.state.user_info.POSITION}</td><td>state{this.state.user_info.STATUS}</td></tr>
                        </tbody>
                    </table>
                    <Button color="inherit" onClick={this.onclick_logout} className={cx('List', 'button1')}>Logout</Button>
                    { this.state.is_admin ? <Button className={cx('List', 'button2')} onClick={()=>this.onClick_call_alert("is_setStatus")}>ステータス変更</Button> : null}
                    { this.state.is_admin ? <Button className={cx('List', 'button2')} onClick={()=>this.onClick_call_alert("is_setSemester")}>評価開始</Button> : null}
                    { this.state.is_admin ? <Button className={cx('List', 'button2')} onClick={()=>this.goto_user_list()}>ユーザー情報</Button> : null}
                </div>

                <Paper className={cx('List', 'root')}>
                <div className={cx('List', 'tableWrapper')}>
                    <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                        { this.state.is_admin ? <TableCell><Checkbox style={{padding:"0"}} color="primary" name="all_check" onChange={this.select_checked} checked={this.state.all_check}></Checkbox></TableCell> : null}
                        {columns.map(column => (
                            <TableCell key={column.id}>
                            {column.subject}
                            </TableCell>
                        ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.target_info.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage).map(row => {
                        return (
                            <TableRow hover role="checkbox" tabIndex={-1} key={row.ID}>
                            { this.state.is_admin ? <TableCell><Checkbox style={{padding:"0"}} color="primary" name={""+row.ID} onChange={this.select_checked} checked={this.state.checked[row.ID]}></Checkbox></TableCell> : null}
                            {columns.map(column => {
                                const value = row[column.id];
                                return (
                                <TableCell key={column.id}  onClick={() => this.onclick_list(row['ID'])}>
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

                <FormControl className={cx('List', 'check')}>
                    <InputLabel>check</InputLabel>
                    <Select
                    id="demo-mutiple-checkbox"
                    //onChange={handleChange}
                    input={<Input />}
                    multiple
                    value={[]}
                    //renderValue={selected => selected.join(', ')}
                    >
                    {
                        constants.SEARCH_CHECKED.map(val => {
                            if(""+this.state.is_admin !== "1" && (""+val.id === "is_shop0" || ""+val.id === "is_shop1")){
                                return;
                            }
                            return (
                                <MenuItem key={val.id}>
                                    <Checkbox
                                        name={val.id}
                                        checked={this.state.search_checked[val.id]}
                                        onChange={this.check_handleChange}
                                        color="primary"
                                    />
                                    <ListItemText primary={val.name} />
                                </MenuItem>
                            )
                        })
                    }
                    </Select>
                </FormControl>

                    <Select
                        className={cx('List', 'select')} 
                        value={this.state.select}
                        onChange={this.handleChange}
                        name="select"
                    >
                    <MenuItem value={"period"}>期</MenuItem>
                    <MenuItem value={"user_id"}>ID</MenuItem>
                    <MenuItem value={"name"}>氏名</MenuItem>
                    <MenuItem value={"head_office"}>本部</MenuItem>
                    <MenuItem value={"office"}>部</MenuItem>
                    <MenuItem value={"grade"}>グレード</MenuItem>
                    <MenuItem value={"status"}>ステータス</MenuItem>
                    </Select>
                    <SearchIcon className={cx('List', 'searchicon')} />
                    <Input placeholder="Search" className={cx('List', 'search_input')} name="search" value={this.state.search} onChange={this.handleChange} onKeyDown={this.search_enter}></Input>                
                    <TablePagination
                        className={cx('List', 'TablePagination')}
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={this.state.target_info.length}
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
                    <Button　variant="outlined" className={cx('List', 'navi_button')} onClick={()=>this.onclick_list(this.state.evaluate_id)}>評価シート</Button>
                    { this.state.is_admin ? <Button variant="outlined" className={cx('List', 'navi_button')} onClick={()=>this.onClick_call_alert("is_adminMSG")}>管理者メッセージ</Button> : null}
                    { this.state.is_admin ? <Button variant="outlined" className={cx('List', 'navi_button')} onClick={()=>this.onClick_call_alert("is_sendMail")}>リマインダー</Button> : null}
                    { this.state.is_admin ? <Button variant="outlined" className={cx('List', 'navi_button')} onClick={this.set_evaluate}>編集</Button> : null}
                    { this.state.is_admin ? <Button variant="outlined" className={cx('List', 'navi_button')} onClick={()=>this.onClick_call_alert("is_import")}>インポート</Button> : null}
                    <Button variant="outlined" className={cx('List', 'navi_button')} onClick={this.export}>エクスポート</Button>
                </div>

                <Dialog
                    open={this.state.is_setStatus}
                    onClose={this.onClick_cancel}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"ステータスを変更しますか？"}</DialogTitle>
                    <DialogContent>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={this.onClick_cancel} color="primary">
                        Disagree
                    </Button>
                    <Button onClick={this.set_status} color="primary" autoFocus>
                        Agree
                    </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={this.state.is_setSemester}
                    onClose={this.onClick_cancel}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"次期の評価開始しますか"}</DialogTitle>
                    <DialogContent>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={this.onClick_cancel} color="primary">
                        Disagree
                    </Button>
                    <Button onClick={this.set_Semester} color="primary" autoFocus>
                        Agree
                    </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={this.state.is_adminMSG} onClose={this.onClick_cancel} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">管理者メッセージ</DialogTitle>
                    <DialogContent>
                    <TextField 
                        variant="outlined" 
                        style={{width:"350px"}}
                        multiline rows="10" 
                        value={this.state.adminMSG}
                        name="adminMSG"
                        onChange={this.handleChange}
                        ></TextField>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={this.onClick_cancel}>
                        Cancel
                    </Button>
                    <Button onClick={this.set_adminMSG}>
                        Submit
                    </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={this.state.is_sendMail} onClose={this.onClick_cancel} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">リマインダー</DialogTitle>
                    <DialogContent style={{height:"200px"}}>
                    <Table size="small" aria-label="a dense table" stickyHeader>
                    <TableHead>
                        <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell align="right">氏名</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            this.state.target_info.map(val=>{
                                return(
                                    Object.keys(this.state.checked).map(val2=>{
                                        if(""+val.ID === ""+val2 && this.state.checked[val2] === true){
                                            return (
                                                <TableRow key={val.ID}>
                                                        <TableCell>{val.USER_ID}</TableCell>
                                                        <TableCell>{val.NAME}</TableCell>
                                                </TableRow>
                                            )
                                        }
                                    })
                                )
                            })
                        }
                    </TableBody>
                    </Table>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={this.onClick_cancel}>
                        Cancel
                    </Button>
                    <Button onClick={this.send_status}>
                        Submit
                    </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={this.state.is_update}
                    onClose={this.onClick_cancel}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <EvaluateUpdate set_update_info={this.state.set_update_info} success_update={this.success_update} onClick_cancel={this.onClick_cancel} router={"evaluate"}></EvaluateUpdate>
                </Dialog>

                <Dialog
                    open={this.state.is_import}
                    onClose={this.onClick_cancel}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <ImportEvaluate onClick_cancel={this.onClick_cancel} success_update={this.success_update}></ImportEvaluate>
                </Dialog>
            </div>
        );
    }
}

export default List;
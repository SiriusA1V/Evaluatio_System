import React from 'react'
import { BrowserRouter} from 'react-router-dom'
import Login_Check from '../shared/Login_Check'

const Root = () => (
    <BrowserRouter>
    <Login_Check/>
    </BrowserRouter>
);

export default Root;
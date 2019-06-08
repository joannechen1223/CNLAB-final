import React, { Component } from 'react'

import './Login.css'

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

class Login extends Component {
    constructor(props) {
    super(props);
        this.state = {
            account: '',
            password: '',
        };
        this.handleAccountChange = this.handleAccountChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.RegisterTheForm = this.RegisterTheForm.bind(this);
        this.SubmitTheForm = this.SubmitTheForm.bind(this);
    }

    handleAccountChange(e) {
        console.log("handleAccountChange");
        console.log(this.state.account);
        this.setState({
            account: e.target.value,
        });
    }

    handlePasswordChange(e) {
        console.log("handlePasswordChange");
        console.log(this.state.password);
        this.setState({
            password: e.target.value,
        });
    }

    RegisterTheForm = e => {
        console.log("RegisterTheForm");
        /* 按下Register之後 */
        console.log(this.state.account);
        console.log(this.state.password);
    }

    SubmitTheForm = e => {
        console.log("SubmitTheForm");
        console.log(this.state.account);
        console.log(this.state.password);

        /* 按下Submit之後 */
        fetch('/api/login', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                account: this.state.account,
                password: this.state.password,
            }),
        })
            .then((res) => (res.json(res)))
            .then(() => {
                console.log("hi");
                // console.log(data.result);
            })
        
    }

    render() {
        return (
        <div className="form">
            <form>
                <h1>Login</h1>
                <div className="form-group row input">
                    <span className="glyphicon glyphicon-user"></span>
                    <input type="text" className="col-sm-10 form-control" id="date" placeholder="account" onChange={this.handleAccountChange}/>
                </div>
                <div className="form-group row input">
                    <span className="glyphicon glyphicon-lock"></span>
                    <input type="text" className="col-sm-10 form-control" id="time" placeholder="password" onChange={this.handlePasswordChange} />
                </div>
                <button className="btn btn-light" onClick={this.RegisterTheForm} >Register</button>
                <button className="btn btn-primary submit" onClick={this.SubmitTheForm} >Submit</button>
            </form>
        </div>
        );
    }
        
}

export default Login;